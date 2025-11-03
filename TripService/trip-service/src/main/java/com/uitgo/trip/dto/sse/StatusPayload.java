package com.uitgo.trip.dto.sse;

import com.uitgo.trip.enums.TripStatus;

public record StatusPayload(Long tripId, TripStatus status) {}
