package com.uitgo.trip.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.uitgo.trip.domain.Offer;
import com.uitgo.trip.domain.Trip;
import com.uitgo.trip.enums.OfferStatus;
import com.uitgo.trip.enums.TripStatus;
import com.uitgo.trip.event.OfferCreatedEvent;
import com.uitgo.trip.event.OfferRemovedEvent;
import com.uitgo.trip.event.TripCancelledEvent;
import com.uitgo.trip.repo.OfferRepository;
import com.uitgo.trip.repo.TripRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.io.IOException;
import java.time.Instant;
import java.util.List;
import java.util.concurrent.*;

@Slf4j
@Service
public class DriverOfferService {

    private final OfferRepository offerRepo;
    private final TripRepository tripRepo;
    private final ObjectMapper om;

    // map driverId -> list of active emitters for that driver
    private final ConcurrentMap<Long, CopyOnWriteArrayList<SseEmitter>> driverEmitters = new ConcurrentHashMap<>();

    public DriverOfferService(OfferRepository offerRepo, TripRepository tripRepo, ObjectMapper om) {
        this.offerRepo = offerRepo;
        this.tripRepo = tripRepo;
        this.om = om;
    }

    @Transactional(readOnly = true)
    public List<Offer> listPendingOffers(Long driverId) {
        return offerRepo.findAll().stream().filter(o -> o.getDriverId().equals(driverId) && o.getStatus()==OfferStatus.PENDING).toList();
    }

    public SseEmitter streamOffers(Long driverId) {
        log.debug("Registering SSE emitter for driver {}", driverId);
        final SseEmitter emitter = new SseEmitter(0L); // no timeout

        // register emitter under driverId
        driverEmitters.computeIfAbsent(driverId, id -> new CopyOnWriteArrayList<>()).add(emitter);

        Runnable cleanup = () -> {
            // remove emitter from driver map(s)
            driverEmitters.forEach((id, list) -> list.remove(emitter));
            try { emitter.complete(); } catch (Exception ignored) {}
            log.debug("Emitter cleaned up for driver {}", driverId);
        };

        emitter.onCompletion(cleanup);
        emitter.onTimeout(cleanup);
        emitter.onError(e -> {
            log.warn("Emitter error for driver {}: {}", driverId, e.getMessage());
            cleanup.run();
        });

        // initial trip list sent once on connect
        try {
            List<Offer> offers = offerRepo.findAll().stream()
                    .filter(o -> o.getDriverId().equals(driverId) && o.getStatus() == OfferStatus.PENDING)
                    .toList();

            List<Trip> pendingTrips = offers.stream()
                    .map(o -> tripRepo.findById(o.getTripId()).orElse(null))
                    .filter(t -> t != null)
                    .toList();

            log.debug("Sending initial tripList to driver {} ({} trips)", driverId, pendingTrips.size());

            if (!pendingTrips.isEmpty()) {
                sendJson(emitter, "tripList", pendingTrips);
            }

        } catch (IOException e) {
            log.warn("Failed to send initial tripList to driver {}: {}", driverId, e.getMessage());
            cleanup.run();
        }

        return emitter;
    }

    // Run after transaction commit so DB state is visible
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onOfferCreated(OfferCreatedEvent event) {
        Offer offer = event.getOffer();
        Long driverId = offer.getDriverId();
        List<SseEmitter> emitters = driverEmitters.get(driverId);
        log.debug("onOfferCreated driverId={} emitters={} offerId={}", driverId, emitters == null ? 0 : emitters.size(), offer.getId());
        if (emitters == null || emitters.isEmpty()) return;

        // fetch trip information for the offer and send trip payload to connected emitters
        Trip trip = tripRepo.findById(offer.getTripId()).orElse(null);
        if (trip == null) {
            for (SseEmitter e : emitters) {
                try {
                    sendJson(e, "offerCreated", offer);
                } catch (IOException ex) {
                    log.warn("Failed to send offerCreated to driver {}: {}", driverId, ex.getMessage());
                    try { e.completeWithError(ex); } catch (Exception ignore) {}
                }
            }
            return;
        }

        for (SseEmitter e : emitters) {
            try {
                sendJson(e, "tripOffered", trip);
            } catch (IOException ex) {
                log.warn("Failed to send tripOffered to driver {}: {}", driverId, ex.getMessage());
                try { e.completeWithError(ex); } catch (Exception ignore) {}
            }
        }
    }

    // Run after transaction commit so DB changes (offers expired) are visible
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onOfferRemoved(OfferRemovedEvent event) {
        Offer offer = event.getOffer();
        Long driverId = offer.getDriverId();
        List<SseEmitter> emitters = driverEmitters.get(driverId);
        log.debug("onOfferRemoved driverId={} emitters={} offerId={}", driverId, emitters == null ? 0 : emitters.size(), offer.getId());
        if (emitters == null || emitters.isEmpty()) return;

        // notify clients which trip was removed so they can update quickly
        for (SseEmitter e : emitters) {
            try {
                sendJson(e, "tripRemoved", offer.getTripId());
            } catch (IOException ex) {
                log.warn("Failed to send tripRemoved to driver {}: {}", driverId, ex.getMessage());
                try { e.completeWithError(ex); } catch (Exception ignore) {}
            }
        }

        // send refreshed tripList (now that DB committed)
        List<Offer> offers = offerRepo.findAll().stream()
                .filter(o -> o.getDriverId().equals(driverId) && o.getStatus() == OfferStatus.PENDING)
                .toList();

        List<Trip> pendingTrips = offers.stream()
                .map(o -> tripRepo.findById(o.getTripId()).orElse(null))
                .filter(t -> t != null)
                .toList();

        log.debug("Sending refreshed tripList to driver {} ({} trips)", driverId, pendingTrips.size());

        for (SseEmitter e : emitters) {
            try {
                sendJson(e, "tripList", pendingTrips);
            } catch (IOException ex) {
                log.warn("Failed to send tripList to driver {}: {}", driverId, ex.getMessage());
                try { e.completeWithError(ex); } catch (Exception ignore) {}
            }
        }
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onTripCancelled(TripCancelledEvent event) {
        Long driverId = event.getDriverId();
        Long tripId = event.getTripId();
        List<SseEmitter> emitters = driverEmitters.get(driverId);
        log.debug("onTripCancelled driverId={} tripId={} emitters={}", driverId, tripId, emitters == null ? 0 : emitters.size());
        if (emitters == null || emitters.isEmpty()) return;

        for (SseEmitter e : emitters) {
            try {
                sendJson(e, "tripRemoved", tripId);
            } catch (IOException ex) {
                log.warn("Failed to send tripRemoved to driver {}: {}", driverId, ex.getMessage());
                try { e.completeWithError(ex); } catch (Exception ignore) {}
            }
        }

        // and refresh tripList
        List<Offer> offers = offerRepo.findAll().stream()
                .filter(o -> o.getDriverId().equals(driverId) && o.getStatus() == OfferStatus.PENDING)
                .toList();

        List<Trip> pendingTrips = offers.stream()
                .map(o -> tripRepo.findById(o.getTripId()).orElse(null))
                .filter(t -> t != null)
                .toList();

        log.debug("Sending refreshed tripList to driver {} ({} trips) after cancellation", driverId, pendingTrips.size());

        for (SseEmitter e : emitters) {
            try {
                sendJson(e, "tripList", pendingTrips);
            } catch (IOException ex) {
                log.warn("Failed to send tripList to driver {}: {}", driverId, ex.getMessage());
                try { e.completeWithError(ex); } catch (Exception ignore) {}
            }
        }
    }

    private void sendJson(SseEmitter emitter, String name, Object payload) throws IOException {
        emitter.send(SseEmitter.event()
                .name(name)
                .id(String.valueOf(System.nanoTime()))
                .reconnectTime(3000)
                .data(om.writeValueAsString(payload), MediaType.APPLICATION_JSON));
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
