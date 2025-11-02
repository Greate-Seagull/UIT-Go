
package com.uitgo.trip.repo;

import com.uitgo.trip.domain.Offer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface OfferRepository extends JpaRepository<Offer, Long> {
    @Query("select o from Offer o where o.status = 'PENDING' and o.expiresAt < ?1")
    List<Offer> findExpiredPendings(Instant now);

    @Query("select o from Offer o where o.tripId = ?1 and o.status = 'PENDING'")
    List<Offer> findPendingsByTripId(Long tripId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
        UPDATE Offer o
           SET o.status = com.uitgo.trip.enums.OfferStatus.EXPIRED
         WHERE o.tripId = :tripId
           AND o.status = com.uitgo.trip.enums.OfferStatus.PENDING
    """)
    int expireAllPendingsOfTrip(@Param("tripId") Long tripId);

    Optional<Offer> findById(Long id);
}
