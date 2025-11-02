package com.uitgo.trip.service;

import com.uitgo.trip.domain.Trip;
import com.uitgo.trip.enums.TripStatus;
import com.uitgo.trip.repo.OfferRepository;
import com.uitgo.trip.repo.TripRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class TripService {
    private final TripRepository tripRepo;
    private final OfferRepository offerRepo;

    @Transactional
    public Trip cancelTrip(Long id, Long passengerId) {
        Trip t = tripRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        if (!passengerId.equals(t.getPassengerId()))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not owner");

        if (t.getStatus()== TripStatus.COMPLETED || t.getStatus()==TripStatus.CANCELED)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot cancel");

        t.setStatus(TripStatus.CANCELED);
        t.setUpdatedAt(Instant.now());

        int affected = offerRepo.expireAllPendingsOfTrip(t.getId());
        return tripRepo.save(t);
    }
}
