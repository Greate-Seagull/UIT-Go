
package com.uitgo.trip.dto;

public record EstimateRes(double distanceKm, long durationMin, long estimatedFare, String currency, double surge){}
