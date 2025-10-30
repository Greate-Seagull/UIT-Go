
package com.uitgo.trip.domain;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "trip_ratings")
public class TripRating {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long tripId;
    private Integer rating;
    @Column(length = 1000)
    private String comment;
    private Instant createdAt;

    public TripRating() {}
    public TripRating(Long tripId, Integer rating, String comment, Instant createdAt) {
        this.tripId = tripId; this.rating = rating; this.comment = comment; this.createdAt = createdAt;
    }
    // getters/setters
    public Long getId() { return id; }
    public Long getTripId() { return tripId; }
    public void setTripId(Long tripId) { this.tripId = tripId; }
    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }
    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
