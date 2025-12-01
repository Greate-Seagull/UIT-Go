package com.uitgo.trip.service;

import com.uitgo.trip.domain.Offer;
import com.uitgo.trip.domain.Trip;
import com.uitgo.trip.enums.OfferStatus;
import com.uitgo.trip.enums.TripStatus;
import com.uitgo.trip.repo.OfferRepository;
import com.uitgo.trip.repo.TripRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;

@Service
public class DriverOfferService {

    private final OfferRepository offerRepo;
    private final TripRepository tripRepo;

    public DriverOfferService(OfferRepository offerRepo, TripRepository tripRepo) {
        this.offerRepo = offerRepo;
        this.tripRepo = tripRepo;
    }

    @Transactional(readOnly = true)
    public List<Offer> listPendingOffers(Long driverId) {
        return offerRepo.findAll().stream().filter(o -> o.getDriverId().equals(driverId) && o.getStatus()==OfferStatus.PENDING).toList();
    }

    @Transactional
    public Trip acceptOffer(Long offerId, Long driverId) {
        Offer o = offerRepo.findById(offerId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (!o.getDriverId().equals(driverId) || o.getStatus()!=OfferStatus.PENDING || o.getExpiresAt().isBefore(Instant.now()))
            throw new ResponseStatusException(HttpStatus.GONE, "Offer invalid");
        o.setStatus(OfferStatus.ACCEPTED); offerRepo.save(o);
        Trip t = tripRepo.findById(o.getTripId()).orElseThrow();
        t.setDriverId(driverId); t.setStatus(TripStatus.ACCEPTED); t.setUpdatedAt(Instant.now());
        return tripRepo.save(t);
    }

    @Transactional
    public void rejectOffer(Long offerId, Long driverId) {
        Offer offer = offerRepo.findById(offerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        if (!offer.getDriverId().equals(driverId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your offer");
        }
        if (offer.getStatus() == OfferStatus.PENDING) {
            offer.setStatus(OfferStatus.REJECTED);
            offerRepo.save(offer);
        }
    }
}
