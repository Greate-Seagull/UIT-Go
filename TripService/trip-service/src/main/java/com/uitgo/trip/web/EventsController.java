package com.uitgo.trip.web;

import com.uitgo.trip.domain.Trip;
import com.uitgo.trip.enums.TripStatus;
import com.uitgo.trip.external.DriverClient;
import com.uitgo.trip.repo.TripRepository;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.*;

@RestController
@RequestMapping("/trips")
public class EventsController {
    private final TripRepository tripRepo;
    private final DriverClient driverClient;
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);

    public EventsController(TripRepository tripRepo, DriverClient driverClient) {
        this.tripRepo = tripRepo; this.driverClient = driverClient;
    }

    @GetMapping(value="/{id}/events", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter events(@PathVariable Long id) {
        Trip t = tripRepo.findById(id).orElseThrow();
        SseEmitter emitter = new SseEmitter(0L); // no timeout
        ScheduledFuture<?> future = scheduler.scheduleAtFixedRate(() -> {
            try {
                Trip current = tripRepo.findById(id).orElse(null);
                if (current == null) { emitter.complete(); return; }
                emitter.send(SseEmitter.event().name("status").data("{\"status\":\""+current.getStatus()+"\"}"));
                if (current.getStatus()== TripStatus.ACCEPTED || current.getStatus()==TripStatus.IN_PROGRESS) {
                    Long driverId = current.getDriverId();
                    if (driverId != null) {
                        emitter.send(SseEmitter.event().name("driver_location").data("{\"driverId\":"+driverId+"}"));
                    }
                }
            } catch (IOException e) {
                emitter.completeWithError(e);
            }
        }, 0, 2, TimeUnit.SECONDS);

        emitter.onCompletion(() -> future.cancel(true));
        emitter.onTimeout(() -> future.cancel(true));
        return emitter;
    }
}
