
package com.uitgo.trip.repo;

import com.uitgo.trip.domain.Offer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface OfferRepository extends JpaRepository<Offer, Long> {
    @Query("select o from Offer o where o.status = 'PENDING' and o.expiresAt < ?1")
    List<Offer> findExpiredPendings(Instant now);

    @Query("select o from Offer o where o.tripId = ?1 and o.status = 'PENDING'")
    List<Offer> findPendingsByTripId(Long tripId);

    @Modifying
    @Query("update Offer o set o.status = 'EXPIRED' where o.tripId = ?1 and o.status = 'PENDING'")
    int expireAllPendingsOfTrip(Long tripId);

    Optional<Offer> findById(Long id);
}
