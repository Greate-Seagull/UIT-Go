package com.uitgo.trip.external;

import com.uitgo.trip.dto.DriverPositionResponse;
import com.uitgo.trip.dto.DriverSearchResponse;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "driver-service",
        url = "${external.driver-service.base-url}",
        dismiss404 = true
)
public interface DriverClient {

    @GetMapping("/api/drivers/search")
    @CircuitBreaker(name = "driverSearch", fallbackMethod = "fallbackSearch")
    DriverSearchResponse search(@RequestParam("lat") Double lat,
                              @RequestParam("lng") Double lng,
                              @RequestParam("radiusMeters") Integer radiusMeters,
                              @RequestParam("limit") Integer limit);

    default DriverSearchResponse fallbackSearch(Double lat, Double lng, Integer radiusMeters, Integer limit, Throwable t) {
        return new DriverSearchResponse();
    }

    @GetMapping("/api/drivers/{driverId}/position")
    @CircuitBreaker(name = "driverGetLocation", fallbackMethod = "fallbackGetLocation")
    DriverPositionResponse getCurrentLocation(@PathVariable("driverId") Long driverId);

    default DriverPositionResponse fallbackGetLocation(Long driverId, Throwable t) {
        return new DriverPositionResponse("error", null);
    }
}
