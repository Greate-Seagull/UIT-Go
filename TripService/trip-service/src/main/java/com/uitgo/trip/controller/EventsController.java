package com.uitgo.trip.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.uitgo.trip.domain.Trip;
import com.uitgo.trip.dto.DriverLocation;
import com.uitgo.trip.dto.sse.DriverLocationPayload;
import com.uitgo.trip.dto.sse.PingPayload;
import com.uitgo.trip.dto.sse.StatusPayload;
import com.uitgo.trip.enums.TripStatus;
import com.uitgo.trip.external.DriverClient;
import com.uitgo.trip.repo.TripRepository;
import jakarta.annotation.Resource;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.time.Instant;
import java.util.concurrent.*;

@RequiredArgsConstructor
@RestController
@RequestMapping("/trips")
public class EventsController {

    private final TripRepository tripRepo;
    private final DriverClient driverClient;

    @Resource(name = "sseScheduler")
    private final ScheduledExecutorService scheduler;
    private final ObjectMapper om;

    private static final long POLL_PERIOD_SEC = 2;
    private static final long HEARTBEAT_PERIOD_SEC = 15;

    @GetMapping(value = "/{id}/events", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter events(@PathVariable Long id) {
        tripRepo.findById(id).orElseThrow();

        final SseEmitter emitter = new SseEmitter(0L);

        ScheduledFuture<?> pollTask = scheduler.scheduleAtFixedRate(() -> {
            try {
                Trip current = tripRepo.findById(id).orElse(null);
                if (current == null) {
                    emitter.complete();
                    return;
                }

                sendJson(emitter, "status", new StatusPayload(current.getId(), current.getStatus()));

               //driver location (khi đã có tài xế và đang chạy)
                if (current.getStatus() == TripStatus.ACCEPTED || current.getStatus() == TripStatus.IN_PROGRESS) {
                    Long driverId = current.getDriverId();
                    if (driverId != null) {
                        try {
                            DriverLocation loc = driverClient.getCurrentLocation(driverId);
                            System.out.printf("loc=%s%n", loc);
                            if (loc != null && loc.lat() != null && loc.lng() != null) {
                                sendJson(emitter, "driver_location",
                                        new DriverLocationPayload(current.getId(), driverId, loc.lat(), loc.lng(), Instant.now().toString()));
                            }
                            else {
                                System.out.printf("loc is null or lat/lng is null%n");
                            }
                        } catch (Exception e) {
                            System.err.printf("Lỗi lấy vị trí tài xế %d: %s%n",
                                    driverId, e.getMessage());
                        }
                    }
                }

                //nếu kết thúc thì đóng stream
                if (current.getStatus() == TripStatus.COMPLETED || current.getStatus() == TripStatus.CANCELED) {
                    emitter.complete();
                }

            } catch (IOException io) {
                emitter.completeWithError(io);
            } catch (Exception ex) {
                emitter.completeWithError(ex);
            }
        }, 0, POLL_PERIOD_SEC, TimeUnit.SECONDS);

        ScheduledFuture<?> heartbeatTask = scheduler.scheduleAtFixedRate(() -> {
            try {
                sendJson(emitter, "ping", new PingPayload(Instant.now().toString()));
            } catch (IOException e) {
                emitter.completeWithError(e);
            }
        }, HEARTBEAT_PERIOD_SEC, HEARTBEAT_PERIOD_SEC, TimeUnit.SECONDS);

        Runnable cleanup = () -> {
            pollTask.cancel(true);
            heartbeatTask.cancel(true);
        };
        emitter.onTimeout(cleanup);
        emitter.onCompletion(cleanup);
        emitter.onError(ex -> cleanup.run());

        // chào kết nối
        try {
            sendJson(emitter, "connected", new PingPayload(Instant.now().toString()));
        } catch (IOException e) {
            cleanup.run();
        }

        return emitter;
    }

    private void sendJson(SseEmitter emitter, String name, Object payload) throws IOException {
        emitter.send(SseEmitter.event()
                .name(name)
                .id(String.valueOf(System.nanoTime()))
                .data(om.writeValueAsString(payload)));
    }
}