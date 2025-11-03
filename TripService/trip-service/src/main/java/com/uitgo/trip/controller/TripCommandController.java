
package com.uitgo.trip.controller;

import com.uitgo.trip.domain.Trip;
import com.uitgo.trip.enums.TripStatus;
import com.uitgo.trip.repo.TripRepository;
import com.uitgo.trip.service.TripCommandService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;

@RestController
@RequestMapping("/trips")
public class TripCommandController {

    private final TripCommandService tripCommandService;

    public TripCommandController(TripCommandService tripCommandService) {
        this.tripCommandService = tripCommandService;
    }

    @PostMapping("/{id}/start")
    public Trip start(@PathVariable Long id, @RequestHeader("X-Driver-Id") Long driverId){
        return tripCommandService.startTrip(id, driverId);
    }

    @PostMapping("/{id}/complete")
    public Trip complete(@PathVariable Long id, @RequestHeader("X-Driver-Id") Long driverId){
        return tripCommandService.completeTrip(id, driverId);
    }
}
