package com.uitgo.trip.service;

import com.uitgo.trip.domain.Offer;
import com.uitgo.trip.domain.Trip;
import com.uitgo.trip.domain.TripRating;
import com.uitgo.trip.dto.CreateTripReq;
import com.uitgo.trip.dto.RateReq;
import com.uitgo.trip.enums.TripStatus;
import com.uitgo.trip.event.OfferRemovedEvent;
import com.uitgo.trip.event.TripCancelledEvent;
import com.uitgo.trip.repo.OfferRepository;
import com.uitgo.trip.repo.TripRatingRepository;
import com.uitgo.trip.repo.TripRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TripService {
    private final TripRepository tripRepo;
    private final OfferRepository offerRepo;
    private final TripRatingRepository ratingRepo;
    private final MatchingService matchingService;
    private final ApplicationEventPublisher publisher;

    @Transactional
    public Trip createTrip(CreateTripReq req, Long passengerId) {
        Trip t = new Trip();
        t.setPassengerId(passengerId);
        t.setStatus(TripStatus.FINDING_DRIVER);
        t.setPickupLat(req.pickupLat());
        t.setPickupLng(req.pickupLng());
        t.setDropoffLat(req.dropoffLat());
        t.setDropoffLng(req.dropoffLng());
        t.setEstimatedFare(28_000L);
        t.setCreatedAt(Instant.now());
        t.setUpdatedAt(Instant.now());
        Trip saved = tripRepo.save(t);

        matchingService.findAndOfferDriver(saved.getId());
        return saved;
    }

    @Transactional(readOnly = true)
    public Trip getTrip(Long id) {
        return tripRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }

    @Transactional
    public Trip cancelTrip(Long id, Long passengerId) {
        Trip t = tripRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        if (!passengerId.equals(t.getPassengerId()))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not owner");

        if (t.getStatus() == TripStatus.CANCELED) {
            return t; // idempotent
        }

        if (t.getStatus()== TripStatus.COMPLETED)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot cancel");

        t.setStatus(TripStatus.CANCELED);
        t.setUpdatedAt(Instant.now());

        List<Offer> pendings = offerRepo.findPendingsByTripId(t.getId());
        // expire offers and publish events for each so listeners can update their SSE lists
        offerRepo.expireAllPendingsOfTrip(t.getId());
        for (Offer o : pendings) {
            publisher.publishEvent(new OfferRemovedEvent(this, o));
            // also publish trip cancelled event for the specific driver so listeners can handle it
            publisher.publishEvent(new TripCancelledEvent(this, o.getTripId(), o.getDriverId()));
        }

        return tripRepo.save(t);
    }

    @Transactional
    public void rateTrip(Long tripId, Long passengerId, RateReq req) {
        Trip t = tripRepo.findById(tripId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        if (!passengerId.equals(t.getPassengerId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not allowed");
        }
        if (t.getStatus() != TripStatus.COMPLETED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Trip not completed");
        }

        // Optional: kiểm tra đã rating chưa (nếu bạn có cột unique)
        ratingRepo.save(new TripRating(tripId, req.rating(), req.comment(), Instant.now()));
    }
}
