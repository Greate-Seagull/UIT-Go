
package com.uitgo.trip.service;

import com.uitgo.trip.domain.Offer;
import com.uitgo.trip.domain.Trip;
import com.uitgo.trip.enums.OfferStatus;
import com.uitgo.trip.enums.TripStatus;
import com.uitgo.trip.external.DriverClient;
import com.uitgo.trip.repo.OfferRepository;
import com.uitgo.trip.repo.TripRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Service
public class MatchingService {
    private final DriverClient driverClient;
    private final OfferRepository offerRepo;
    private final TripRepository tripRepo;

    public MatchingService(DriverClient driverClient, OfferRepository offerRepo, TripRepository tripRepo) {
        this.driverClient = driverClient;
        this.offerRepo = offerRepo;
        this.tripRepo = tripRepo;
    }

    @Transactional
    public void findAndOfferDriver(Trip trip){
        List<Map<String,Object>> drivers = driverClient.search(trip.getPickupLat(), trip.getPickupLng(), 3000, 10);
        if (drivers == null || drivers.isEmpty()) {
            return; // vẫn ở FINDING_DRIVER
        }
        Long driverId = Long.valueOf(drivers.get(0).get("driverId").toString());
        Offer offer = new Offer(trip.getId(), driverId, OfferStatus.PENDING, Instant.now().plusSeconds(15), Instant.now());
        offerRepo.save(offer);
        trip.setStatus(TripStatus.OFFERING);
        tripRepo.save(trip);
    }
}
