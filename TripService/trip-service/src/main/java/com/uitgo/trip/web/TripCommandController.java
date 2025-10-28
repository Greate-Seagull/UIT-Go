
package com.uitgo.trip.web;

import com.uitgo.trip.domain.Trip;
import com.uitgo.trip.enums.TripStatus;
import com.uitgo.trip.repo.TripRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;

@RestController
@RequestMapping("/trips")
public class TripCommandController {
    private final TripRepository tripRepo;
    public TripCommandController(TripRepository tripRepo) { this.tripRepo = tripRepo; }

    @PostMapping("/{id}/start")
    public Trip start(@PathVariable Long id, @RequestHeader("X-Driver-Id") Long driverId){
        Trip t = tripRepo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (!driverId.equals(t.getDriverId()) || t.getStatus()!= TripStatus.ACCEPTED)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST);
        t.setStatus(TripStatus.IN_PROGRESS); t.setUpdatedAt(Instant.now());
        return tripRepo.save(t);
    }

    @PostMapping("/{id}/complete")
    public Trip complete(@PathVariable Long id, @RequestHeader("X-Driver-Id") Long driverId){
        Trip t = tripRepo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (!driverId.equals(t.getDriverId()) || t.getStatus()!= TripStatus.IN_PROGRESS)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST);
        t.setStatus(TripStatus.COMPLETED);
        t.setFinalFare(t.getEstimatedFare());
        t.setUpdatedAt(Instant.now());
        return tripRepo.save(t);
    }
}
