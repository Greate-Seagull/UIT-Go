package com.uitgo.trip.service;

import com.uitgo.trip.domain.Offer;
import com.uitgo.trip.domain.Trip;
import com.uitgo.trip.dto.DriverNearby;
import com.uitgo.trip.enums.OfferStatus;
import com.uitgo.trip.enums.TripStatus;
import com.uitgo.trip.external.DriverClient;
import com.uitgo.trip.repo.OfferRepository;
import com.uitgo.trip.repo.TripRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class MatchingService {

    private final TripRepository tripRepo;
    private final OfferRepository offerRepo;
    private final DriverClient driverClient;

    @Async
    public void triggerMatchingAsync(Long tripId) {
        try {
            findAndOfferDriver(tripId);
        } catch (Exception e) {
            log.error("Matching error for trip {}: {}", tripId, e.getMessage(), e);
        }
    }

    @Transactional
    public void findAndOfferDriver(Long tripId) {
        Trip trip = tripRepo.findById(tripId).orElse(null);
        if (trip == null) {
            log.warn("Trip {} not found; skip matching", tripId);
            return;
        }

        List<DriverNearby> drivers;
        try {
            drivers = driverClient.search(trip.getPickupLat(), trip.getPickupLng(), 3000, 10);
        } catch (Exception ex) {
            log.warn("Driver service call failed for trip {}: {}", tripId, ex.toString());
            return; // giữ FINDING_DRIVER
        }

        if (drivers == null || drivers.isEmpty()) {
            log.info("No nearby drivers for trip {}", tripId);
            return;
        }

        Long driverId = drivers.get(0).driverId();
        if (driverId == null) {
            log.warn("driverId missing in first driver result for trip {}", tripId);
            return;
        }

        Offer offer = new Offer(trip.getId(), driverId, OfferStatus.PENDING,
                Instant.now().plusSeconds(15), Instant.now());

        offerRepo.save(offer);
        trip.setStatus(TripStatus.OFFERING);
        trip.setUpdatedAt(Instant.now());
        tripRepo.save(trip);

        log.info("Offered driver {} for trip {}", driverId, tripId);
    }
}
