
package com.uitgo.trip.dto;

import jakarta.validation.constraints.NotNull;

public record EstimateReq(
        @NotNull Double pickupLat, @NotNull Double pickupLng,
        @NotNull Double dropoffLat, @NotNull Double dropoffLng,
        String timeOfDay
) {}
