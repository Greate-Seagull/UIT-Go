
package com.uitgo.trip.web;

import com.uitgo.trip.dto.EstimateReq;
import com.uitgo.trip.dto.EstimateRes;
import com.uitgo.trip.service.PricingService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/pricing")
public class PricingController {
    private final PricingService pricingService;

    public PricingController(PricingService pricingService) { this.pricingService = pricingService; }

    @PostMapping("/estimate")
    public EstimateRes estimate(@Valid @RequestBody EstimateReq req){
        double surge = "PEAK".equalsIgnoreCase(req.timeOfDay()) ? 1.2 : 1.0;
        return pricingService.estimate(req.pickupLat(), req.pickupLng(), req.dropoffLat(), req.dropoffLng(), surge);
    }
}
