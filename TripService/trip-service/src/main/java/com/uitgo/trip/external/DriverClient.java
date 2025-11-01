
package com.uitgo.trip.external;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@Component
public class DriverClient {
    private final RestClient rest;

    public DriverClient(@Value("${external.driver-service.base-url:http://localhost:3000}") String baseUrl) {
        this.rest = RestClient.builder().baseUrl(baseUrl).build();
    }

    @SuppressWarnings("unchecked")
    public List<Map<String,Object>> search(double lat, double lng, double radiusMeters, int limit){
        ResponseEntity<List> res = rest.get()
                .uri(uri -> uri.path("/api/drivers/search")
                        .queryParam("lat", lat)
                        .queryParam("lng", lng)
                        .queryParam("radiusMeters", radiusMeters)
                        .queryParam("limit", limit)
                        .build())
                .retrieve()
                .toEntity(List.class);
        System.out.println(res);
        return res.getBody();
    }
}
