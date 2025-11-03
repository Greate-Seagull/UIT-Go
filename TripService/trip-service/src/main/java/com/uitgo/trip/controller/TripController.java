
package com.uitgo.trip.controller;

import com.uitgo.trip.domain.Trip;
import com.uitgo.trip.dto.CancelReq;
import com.uitgo.trip.dto.CreateTripReq;
import com.uitgo.trip.dto.RateReq;
import com.uitgo.trip.enums.TripStatus;
import com.uitgo.trip.repo.OfferRepository;
import com.uitgo.trip.repo.TripRatingRepository;
import com.uitgo.trip.repo.TripRepository;
import com.uitgo.trip.service.MatchingService;
import com.uitgo.trip.service.TripService;
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

    private final TripService tripService;

    public TripController(TripRepository tripRepo, OfferRepository offerRepo, TripRatingRepository ratingRepo, MatchingService matchingService, TripService tripService) {
        this.tripRepo = tripRepo;
        this.offerRepo = offerRepo;
        this.ratingRepo = ratingRepo;
        this.matchingService = matchingService;
        this.tripService = tripService;
    }

    @PostMapping
    public Trip create(@Valid @RequestBody CreateTripReq req, @RequestHeader("X-User-Id") Long passengerId){
        return tripService.createTrip(req, passengerId);
    }

    @GetMapping("/{id}")
    public Trip get(@PathVariable Long id){
        return tripService.getTrip(id);
    }

    @PostMapping("/{id}/cancel")
    public Trip cancel(@PathVariable Long id,
                       @RequestHeader("X-User-Id") Long passengerId,
                       @RequestBody(required = false) CancelReq req) {
        return tripService.cancelTrip(id, passengerId);
    }

    @PostMapping("/{id}/rating")
    public ResponseEntity<?> rate(@PathVariable Long id, @Valid @RequestBody RateReq req, @RequestHeader("X-User-Id") Long passengerId){
        tripService.rateTrip(id, passengerId, req);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }
}
