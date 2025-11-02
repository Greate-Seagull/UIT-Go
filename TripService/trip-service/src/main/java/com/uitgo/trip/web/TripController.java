
package com.uitgo.trip.web;

import com.uitgo.trip.domain.Trip;
import com.uitgo.trip.dto.CancelReq;
import com.uitgo.trip.dto.CreateTripReq;
import com.uitgo.trip.dto.RateReq;
import com.uitgo.trip.enums.TripStatus;
import com.uitgo.trip.repo.OfferRepository;
import com.uitgo.trip.repo.TripRatingRepository;
import com.uitgo.trip.repo.TripRepository;
import com.uitgo.trip.service.MatchingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;

@RestController
@RequestMapping("/trips")
public class TripController {
    private final TripRepository tripRepo;
    private final OfferRepository offerRepo;
    private final TripRatingRepository ratingRepo;
    private final MatchingService matchingService;

    public TripController(TripRepository tripRepo, OfferRepository offerRepo, TripRatingRepository ratingRepo, MatchingService matchingService) {
        this.tripRepo = tripRepo;
        this.offerRepo = offerRepo;
        this.ratingRepo = ratingRepo;
        this.matchingService = matchingService;
    }

    @PostMapping
    public Trip create(@Valid @RequestBody CreateTripReq req, @RequestHeader("X-User-Id") Long passengerId){
        Trip t = new Trip();
        t.setPassengerId(passengerId);
        t.setStatus(TripStatus.FINDING_DRIVER);
        t.setPickupLat(req.pickupLat()); t.setPickupLng(req.pickupLng());
        t.setDropoffLat(req.dropoffLat()); t.setDropoffLng(req.dropoffLng());
        t.setEstimatedFare(28000L); // set tạm, FE gọi /pricing trước
        t.setCreatedAt(Instant.now()); t.setUpdatedAt(Instant.now());
        Trip saved = tripRepo.save(t);
        matchingService.triggerMatchingAsync(saved.getId());
        return saved;
    }

    @GetMapping("/{id}")
    public Trip get(@PathVariable Long id){
        return tripRepo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }

    @PostMapping("/{id}/cancel")
    public Trip cancel(@PathVariable Long id, @RequestHeader("X-User-Id") Long passengerId, @RequestBody(required = false) CancelReq req){
        Trip t = tripRepo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (!passengerId.equals(t.getPassengerId()))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not owner");
        if (t.getStatus()==TripStatus.COMPLETED || t.getStatus()==TripStatus.CANCELED)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot cancel");
        t.setStatus(TripStatus.CANCELED); t.setUpdatedAt(Instant.now());
        offerRepo.expireAllPendingsOfTrip(t.getId());
        return tripRepo.save(t);
    }

    @PostMapping("/{id}/rating")
    public ResponseEntity<?> rate(@PathVariable Long id, @Valid @RequestBody RateReq req, @RequestHeader("X-User-Id") Long passengerId){
        Trip t = tripRepo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (!passengerId.equals(t.getPassengerId()) || t.getStatus()!=TripStatus.COMPLETED)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Not allowed");
        ratingRepo.save(new com.uitgo.trip.domain.TripRating(id, req.rating(), req.comment(), Instant.now()));
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }
}
