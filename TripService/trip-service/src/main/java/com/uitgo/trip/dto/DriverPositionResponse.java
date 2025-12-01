package com.uitgo.trip.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class DriverPositionResponse {
    private String status;
    private DriverLocation data;

    public DriverPositionResponse() {}

    public DriverPositionResponse(String status, DriverLocation data) {
        this.status = status;
        this.data = data;
    }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public DriverLocation getData() { return data; }
    public void setData(DriverLocation data) { this.data = data; }
}

