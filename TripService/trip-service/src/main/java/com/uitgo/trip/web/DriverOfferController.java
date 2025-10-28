
package com.uitgo.trip.web;

import com.uitgo.trip.domain.Offer;
import com.uitgo.trip.domain.Trip;
import com.uitgo.trip.enums.OfferStatus;
import com.uitgo.trip.enums.TripStatus;
import com.uitgo.trip.repo.OfferRepository;
import com.uitgo.trip.repo.TripRepository;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/driver/offers")
public class DriverOfferController {
    private final OfferRepository offerRepo;
    private final TripRepository tripRepo;

    public DriverOfferController(OfferRepository offerRepo, TripRepository tripRepo) {
        this.offerRepo = offerRepo; this.tripRepo = tripRepo;
    }

    @GetMapping
    public List<Offer> list(@RequestHeader("X-Driver-Id") Long driverId) {
        // đơn giản: trả mọi offer (pending) của driver
        return offerRepo.findAll().stream().filter(o -> o.getDriverId().equals(driverId) && o.getStatus()==OfferStatus.PENDING).toList();
    }

    @PostMapping("/{id}/accept")
    @Transactional
    public Trip accept(@PathVariable Long id, @RequestHeader("X-Driver-Id") Long driverId){
        Offer o = offerRepo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (!o.getDriverId().equals(driverId) || o.getStatus()!=OfferStatus.PENDING || o.getExpiresAt().isBefore(Instant.now()))
            throw new ResponseStatusException(HttpStatus.GONE, "Offer invalid");
        o.setStatus(OfferStatus.ACCEPTED); offerRepo.save(o);
        Trip t = tripRepo.findById(o.getTripId()).orElseThrow();
        t.setDriverId(driverId); t.setStatus(TripStatus.ACCEPTED); t.setUpdatedAt(Instant.now());
        return tripRepo.save(t);
    }

    @PostMapping("/{id}/reject")
    public void reject(@PathVariable Long id, @RequestHeader("X-Driver-Id") Long driverId){
        Offer o = offerRepo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (o.getDriverId().equals(driverId) && o.getStatus()==OfferStatus.PENDING) {
            o.setStatus(OfferStatus.REJECTED); offerRepo.save(o);
        }
    }
}
