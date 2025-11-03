package com.uitgo.trip.service;

import com.uitgo.trip.domain.Trip;
import com.uitgo.trip.enums.TripStatus;
import com.uitgo.trip.repo.TripRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;

@Service
public class TripCommandService {

    private final TripRepository tripRepo;

    public TripCommandService(TripRepository tripRepo) {
        this.tripRepo = tripRepo;
    }

    @Transactional
    public Trip startTrip(Long tripId, Long driverId) {
        Trip t = tripRepo.findById(tripId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        if (!driverId.equals(t.getDriverId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your trip");
        }

        if (t.getStatus() == TripStatus.IN_PROGRESS) {
            return t;
        }

        if (t.getStatus() != TripStatus.ACCEPTED) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "Trip not in ACCEPTED state");
        }

        t.setStatus(TripStatus.IN_PROGRESS);
        t.setUpdatedAt(Instant.now());

        return tripRepo.save(t);
    }

    @Transactional
    public Trip completeTrip(Long tripId, Long driverId) {
        Trip t = tripRepo.findById(tripId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        if (!driverId.equals(t.getDriverId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your trip");
        }

        if (t.getStatus() == TripStatus.COMPLETED) {
            return t;
        }

        if (t.getStatus() != TripStatus.IN_PROGRESS) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "Trip not in IN_PROGRESS state");
        }

        t.setStatus(TripStatus.COMPLETED);
        if (t.getFinalFare() == null) {
            t.setFinalFare(t.getEstimatedFare());
        }
        t.setUpdatedAt(Instant.now());

        return tripRepo.save(t);
    }
}
