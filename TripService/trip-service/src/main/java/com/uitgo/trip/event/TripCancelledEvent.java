package com.uitgo.trip.event;

import org.springframework.context.ApplicationEvent;

public class TripCancelledEvent extends ApplicationEvent {
    private final Long tripId;
    private final Long driverId;

    public TripCancelledEvent(Object source, Long tripId, Long driverId) {
        super(source);
        this.tripId = tripId;
        this.driverId = driverId;
    }

    public Long getTripId() { return tripId; }
    public Long getDriverId() { return driverId; }
}

