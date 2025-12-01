package com.uitgo.trip.dto.sse;

public record DriverLocationPayload(Long tripId, Long driverId, Double lat, Double lng, String updatedAt) {}
