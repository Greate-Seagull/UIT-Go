
package com.uitgo.trip.dto;

import jakarta.validation.constraints.NotNull;

public record CreateTripReq(
        @NotNull Double pickupLat, @NotNull Double pickupLng,
        @NotNull Double dropoffLat, @NotNull Double dropoffLng
) {}
