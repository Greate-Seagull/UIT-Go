package com.uitgo.trip.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record DriverLocation(Long driverId, Double lat, @JsonProperty("long") Double lng) {}
