package com.uitgo.trip.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public class DriverSearchResponse {
    private String status;
    private List<DriverNearby> data;

    public DriverSearchResponse() {}

    public DriverSearchResponse(String status, List<DriverNearby> data) {
        this.status = status;
        this.data = data;
    }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public List<DriverNearby> getData() { return data; }
    public void setData(List<DriverNearby> data) { this.data = data; }
}

