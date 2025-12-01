package com.uitgo.trip.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.uitgo.trip.domain.Trip;
import com.uitgo.trip.dto.DriverLocation;
import com.uitgo.trip.dto.DriverPositionResponse;
import com.uitgo.trip.dto.sse.DriverLocationPayload;
import com.uitgo.trip.dto.sse.PingPayload;
import com.uitgo.trip.dto.sse.StatusPayload;
import com.uitgo.trip.enums.TripStatus;
import com.uitgo.trip.external.DriverClient;
import com.uitgo.trip.repo.TripRepository;
import jakarta.annotation.Resource;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.time.Instant;
import java.util.List;
import java.util.concurrent.*;

@Service
@RequiredArgsConstructor
public class TripEventsService {

    private final TripRepository tripRepo;
    private final DriverClient driverClient;
    private final ObjectMapper om;

    @Resource(name = "sseScheduler")
    private ScheduledExecutorService scheduler;

    private final ConcurrentMap<SseEmitter, List<ScheduledFuture<?>>> emitterTasks = new ConcurrentHashMap<>();

    private static final long POLL_PERIOD_SEC = 2;
    private static final long HEARTBEAT_PERIOD_SEC = 15;

    public SseEmitter openStream(Long tripId) {
        tripRepo.findById(tripId).orElseThrow();

        final SseEmitter emitter = new SseEmitter(0L); // no timeout
        ScheduledFuture<?> pollTask = schedulePoll(emitter, tripId);
        ScheduledFuture<?> heartbeatTask = scheduleHeartbeat(emitter);

        emitterTasks.put(emitter, List.of(pollTask, heartbeatTask));

        Runnable cleanup = () -> {
            List<ScheduledFuture<?>> tasks = emitterTasks.remove(emitter);
            if (tasks != null) {
                tasks.forEach(f -> {
                    if (f != null && !f.isCancelled()) f.cancel(true);
                });
            }
        };
        emitter.onCompletion(cleanup);
        emitter.onTimeout(cleanup);
        emitter.onError(e -> cleanup.run());

        // chào kết nối
        try {
            sendJson(emitter, "connected", new PingPayload(Instant.now().toString()));
        } catch (IOException e) {
            cleanup.run();
        }

        return emitter;
    }

    private ScheduledFuture<?> schedulePoll(SseEmitter emitter, Long tripId) {
        return scheduler.scheduleAtFixedRate(() -> {
            try {
                Trip current = tripRepo.findById(tripId).orElse(null);
                if (current == null) {
                    safeComplete(emitter);
                    return;
                }

                // (1) status
                sendJson(emitter, "status",
                        new StatusPayload(current.getId(), current.getStatus()));

                // (2) driver_location khi có tài xế
                if (current.getStatus() == TripStatus.ACCEPTED || current.getStatus() == TripStatus.IN_PROGRESS) {
                    Long driverId = current.getDriverId();
                    if (driverId != null) {
                        try {
                            DriverPositionResponse response = driverClient.getCurrentLocation(driverId);
                            if (response != null && "success".equals(response.getStatus())) {
                                DriverLocation loc = response.getData();
                                if (loc != null && loc.lat() != null && loc.lng() != null) {
                                    sendJson(emitter, "driver_location",
                                            new DriverLocationPayload(
                                                    current.getId(),
                                                    driverId,
                                                    loc.lat(),
                                                    loc.lng(),
                                                    Instant.now().toString()
                                            ));
                                }
                            }
                        } catch (Exception ex) {
                            // log nhẹ, không cắt stream
                            System.err.printf("Get location error for driver %d: %s%n", driverId, ex.getMessage());
                        }
                    }
                }

                // (3) kết thúc -> đóng stream
                if (current.getStatus() == TripStatus.COMPLETED || current.getStatus() == TripStatus.CANCELED) {
                    safeComplete(emitter);
                }
            } catch (IOException io) {
                safeError(emitter, io);
            } catch (Exception ex) {
                safeError(emitter, ex);
            }
        }, 0, POLL_PERIOD_SEC, TimeUnit.SECONDS);
    }

    private ScheduledFuture<?> scheduleHeartbeat(SseEmitter emitter) {
        return scheduler.scheduleAtFixedRate(() -> {
            try {
                sendJson(emitter, "ping", new PingPayload(Instant.now().toString()));
            } catch (IOException e) {
                safeError(emitter, e);
            }
        }, HEARTBEAT_PERIOD_SEC, HEARTBEAT_PERIOD_SEC, TimeUnit.SECONDS);
    }

    private void sendJson(SseEmitter emitter, String name, Object payload) throws IOException {
        emitter.send(SseEmitter.event()
                .name(name)
                .id(String.valueOf(System.nanoTime()))
                .reconnectTime(3000) // gợi ý client retry
                .data(om.writeValueAsString(payload), MediaType.APPLICATION_JSON));
    }

    private void safeComplete(SseEmitter emitter) {
        try { emitter.complete(); } catch (Exception ignore) {}
    }

    private void safeError(SseEmitter emitter, Exception e) {
        try { emitter.completeWithError(e); } catch (Exception ignore) {}
    }
}
