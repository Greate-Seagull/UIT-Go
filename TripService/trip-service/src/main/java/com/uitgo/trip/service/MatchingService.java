package com.uitgo.trip.service;

import com.uitgo.trip.domain.Offer;
import com.uitgo.trip.domain.Trip;
import com.uitgo.trip.dto.DriverNearby;
import com.uitgo.trip.dto.DriverSearchResponse;
import com.uitgo.trip.enums.OfferStatus;
import com.uitgo.trip.enums.TripStatus;
import com.uitgo.trip.event.OfferCreatedEvent;
import com.uitgo.trip.external.DriverClient;
import com.uitgo.trip.repo.OfferRepository;
import com.uitgo.trip.repo.TripRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
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
    private final ApplicationEventPublisher publisher;

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

        DriverSearchResponse resp = driverClient.search(trip.getPickupLat(), trip.getPickupLng(), 10000, 10);
        if (resp == null || resp.getData() == null || resp.getData().isEmpty()) {
            log.info("No nearby drivers for trip {}", tripId);
            return;
        }

        List<DriverNearby> drivers = resp.getData();
        DriverNearby first = drivers.get(0);
        if (first == null || first.driverId() == null) {
            log.warn("No valid driver returned for trip {}", tripId);
            return;
        }

        Long driverId = first.driverId();

        Offer offer = new Offer(trip.getId(), driverId, OfferStatus.PENDING, Instant.now().plusSeconds(15 * 60), Instant.now());
        Offer saved = offerRepo.save(offer);
        trip.setStatus(TripStatus.OFFERING);
        trip.setUpdatedAt(Instant.now());
        tripRepo.save(trip);

        publisher.publishEvent(new OfferCreatedEvent(this, saved));

        log.info("Offered driver {} for trip {}", driverId, tripId);
    }
}
