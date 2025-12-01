package com.uitgo.trip.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record DriverNearby(
        @JsonProperty("driverId") Long driverId,
        @JsonProperty("lat") Double lat,
        @JsonProperty("long") Double lng
) {}
