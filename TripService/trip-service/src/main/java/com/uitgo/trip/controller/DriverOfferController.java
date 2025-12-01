
package com.uitgo.trip.controller;

import com.uitgo.trip.domain.Offer;
import com.uitgo.trip.domain.Trip;
import com.uitgo.trip.enums.OfferStatus;
import com.uitgo.trip.enums.TripStatus;
import com.uitgo.trip.repo.OfferRepository;
import com.uitgo.trip.repo.TripRepository;
import com.uitgo.trip.service.DriverOfferService;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/trip/offers")
public class DriverOfferController {

    private final DriverOfferService driverOfferService;

    public DriverOfferController(DriverOfferService driverOfferService) {
        this.driverOfferService = driverOfferService;
    }

    @GetMapping
    public List<Offer> list(@RequestHeader("X-Driver-Id") Long driverId) {
        return driverOfferService.listPendingOffers(driverId);
    }

    @PostMapping("/{id}/accept")
    @Transactional
    public Trip accept(@PathVariable Long id, @RequestHeader("X-Driver-Id") Long driverId){
        return driverOfferService.acceptOffer(id, driverId);
    }

    @PostMapping("/{id}/reject")
    public void reject(@PathVariable Long id, @RequestHeader("X-Driver-Id") Long driverId){
        driverOfferService.rejectOffer(id, driverId);
    }
}
