
package com.uitgo.trip.domain;

import com.uitgo.trip.enums.TripStatus;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "trips")
public class Trip {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long passengerId;
    private Long driverId;

    @Enumerated(EnumType.STRING)
    private TripStatus status;

    private Double pickupLat;
    private Double pickupLng;
    private Double dropoffLat;
    private Double dropoffLng;

    private Long estimatedFare;
    private Long finalFare;

    private Instant createdAt;
    private Instant updatedAt;

    // getters/setters
    public Long getId() { return id; }
    public Long getPassengerId() { return passengerId; }
    public void setPassengerId(Long passengerId) { this.passengerId = passengerId; }
    public Long getDriverId() { return driverId; }
    public void setDriverId(Long driverId) { this.driverId = driverId; }
    public TripStatus getStatus() { return status; }
    public void setStatus(TripStatus status) { this.status = status; }
    public Double getPickupLat() { return pickupLat; }
    public void setPickupLat(Double pickupLat) { this.pickupLat = pickupLat; }
    public Double getPickupLng() { return pickupLng; }
    public void setPickupLng(Double pickupLng) { this.pickupLng = pickupLng; }
    public Double getDropoffLat() { return dropoffLat; }
    public void setDropoffLat(Double dropoffLat) { this.dropoffLat = dropoffLat; }
    public Double getDropoffLng() { return dropoffLng; }
    public void setDropoffLng(Double dropoffLng) { this.dropoffLng = dropoffLng; }
    public Long getEstimatedFare() { return estimatedFare; }
    public void setEstimatedFare(Long estimatedFare) { this.estimatedFare = estimatedFare; }
    public Long getFinalFare() { return finalFare; }
    public void setFinalFare(Long finalFare) { this.finalFare = finalFare; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
