package com.uitgo.trip.controller;

import com.uitgo.trip.domain.Offer;
import com.uitgo.trip.domain.Trip;
import com.uitgo.trip.service.DriverOfferService;
import jakarta.transaction.Transactional;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;

@RestController
@RequestMapping("/trip/offers")
public class DriverOfferController {

    private final DriverOfferService driverOfferService;

    public DriverOfferController(DriverOfferService driverOfferService) {
        this.driverOfferService = driverOfferService;
    }

    @GetMapping(produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter stream(@RequestHeader("X-Driver-Id") Long driverId) {
        return driverOfferService.streamOffers(driverId);
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
