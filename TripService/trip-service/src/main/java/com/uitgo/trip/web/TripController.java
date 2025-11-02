
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
import com.uitgo.trip.service.TripService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
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
        System.out.println(String.format("Call API POST /trips/"));
        Trip t = new Trip();
        t.setPassengerId(passengerId);
        t.setStatus(TripStatus.FINDING_DRIVER);
        t.setPickupLat(req.pickupLat()); t.setPickupLng(req.pickupLng());
        t.setDropoffLat(req.dropoffLat()); t.setDropoffLng(req.dropoffLng());
        t.setEstimatedFare(28000L); // set tạm, FE gọi /pricing trước
        t.setCreatedAt(Instant.now()); t.setUpdatedAt(Instant.now());
        Trip saved = tripRepo.save(t);
        matchingService.findAndOfferDriver(saved.getId());

        System.out.println(String.format("Complete API POST /trips/"));
        return saved;
    }

    @GetMapping("/{id}")
    public Trip get(@PathVariable Long id){
        return tripRepo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }

    @PostMapping("/{id}/cancel")
    public Trip cancel(@PathVariable Long id,
                       @RequestHeader("X-User-Id") Long passengerId,
                       @RequestBody(required = false) CancelReq req) {
        System.out.printf("Calla API POST /trips/%s/cancel%n", id);
        Trip r = tripService.cancelTrip(id, passengerId);
        System.out.printf("Done API POST /trips/%s/cancel%n", id);
        return r;
    }

    @PostMapping("/{id}/rating")
    public ResponseEntity<?> rate(@PathVariable Long id, @Valid @RequestBody RateReq req, @RequestHeader("X-User-Id") Long passengerId){
        System.out.println(String.format("Call API POST /trips/%s/rating", id));

        Trip t = tripRepo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (!passengerId.equals(t.getPassengerId()) || t.getStatus()!=TripStatus.COMPLETED)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Not allowed");
        ratingRepo.save(new com.uitgo.trip.domain.TripRating(id, req.rating(), req.comment(), Instant.now()));

        System.out.println(String.format("Complete API POST /trips/%s/rating", id));
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }
}
