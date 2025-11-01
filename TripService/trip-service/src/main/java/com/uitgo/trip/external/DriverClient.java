package com.uitgo.trip.external;

import com.uitgo.trip.dto.DriverNearby;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.Collections;
import java.util.List;

@FeignClient(name = "driver-service", url = "${external.driver-service.base-url}")
public interface DriverClient {

    @GetMapping("/drivers/search")
    @CircuitBreaker(name = "driverSearch", fallbackMethod = "fallbackSearch")
    List<DriverNearby> search(@RequestParam("lat") Double lat,
                              @RequestParam("lng") Double lng,
                              @RequestParam("radius") Integer radiusMeters,
                              @RequestParam("limit") Integer limit);

    default List<DriverNearby> fallbackSearch(Double lat, Double lng, Integer radiusMeters, Integer limit, Throwable t) {
        return Collections.emptyList();
    }
}
