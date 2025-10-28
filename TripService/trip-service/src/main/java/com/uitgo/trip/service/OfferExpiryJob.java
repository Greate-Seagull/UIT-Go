
package com.uitgo.trip.service;

import com.uitgo.trip.domain.Offer;
import com.uitgo.trip.enums.TripStatus;
import com.uitgo.trip.repo.OfferRepository;
import com.uitgo.trip.repo.TripRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Component
public class OfferExpiryJob {
    private final OfferRepository offerRepo;
    private final TripRepository tripRepo;

    public OfferExpiryJob(OfferRepository offerRepo, TripRepository tripRepo) {
        this.offerRepo = offerRepo;
        this.tripRepo = tripRepo;
    }

    @Scheduled(fixedRate = 1000)
    @Transactional
    public void expire() {
        Instant now = Instant.now();
        List<Offer> expired = offerRepo.findExpiredPendings(now);
        for (Offer o : expired) {
            o.setStatus(com.uitgo.trip.enums.OfferStatus.EXPIRED);
            offerRepo.save(o);
            var t = tripRepo.findById(o.getTripId()).orElse(null);
            if (t != null && t.getStatus() == TripStatus.OFFERING) {
                t.setStatus(TripStatus.FINDING_DRIVER);
                tripRepo.save(t);
            }
        }
    }
}
