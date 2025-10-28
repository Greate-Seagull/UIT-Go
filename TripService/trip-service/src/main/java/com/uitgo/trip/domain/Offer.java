
package com.uitgo.trip.domain;

import com.uitgo.trip.enums.OfferStatus;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "offers")
public class Offer {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long tripId;
    private Long driverId;

    @Enumerated(EnumType.STRING)
    private OfferStatus status;

    private Instant expiresAt;
    private Instant createdAt;

    public Offer() {}

    public Offer(Long tripId, Long driverId, OfferStatus status, Instant expiresAt, Instant createdAt) {
        this.tripId = tripId;
        this.driverId = driverId;
        this.status = status;
        this.expiresAt = expiresAt;
        this.createdAt = createdAt;
    }

    // getters/setters
    public Long getId() { return id; }
    public Long getTripId() { return tripId; }
    public void setTripId(Long tripId) { this.tripId = tripId; }
    public Long getDriverId() { return driverId; }
    public void setDriverId(Long driverId) { this.driverId = driverId; }
    public OfferStatus getStatus() { return status; }
    public void setStatus(OfferStatus status) { this.status = status; }
    public Instant getExpiresAt() { return expiresAt; }
    public void setExpiresAt(Instant expiresAt) { this.expiresAt = expiresAt; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
