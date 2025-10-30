
package com.uitgo.trip.service;

import com.uitgo.trip.dto.EstimateRes;
import org.springframework.stereotype.Service;

@Service
public class PricingService {
    public EstimateRes estimate(double lat1,double lng1,double lat2,double lng2, double surge){
        double km = haversineKm(lat1,lng1,lat2,lng2);
        long base = 12000, perKm = 8000;
        long fare = Math.round((base + perKm * Math.max(1.0, km)) * surge);
        long duration = Math.round(km * 3); // 3 phút / km (giả định)
        return new EstimateRes(km, duration, fare, "VND", surge);
    }
    private static double haversineKm(double lat1,double lon1,double lat2,double lon2){
        double R = 6371.0;
        double dLat = Math.toRadians(lat2-lat1);
        double dLon = Math.toRadians(lon2-lon1);
        double a = Math.sin(dLat/2)*Math.sin(dLat/2) +
                   Math.cos(Math.toRadians(lat1))*Math.cos(Math.toRadians(lat2))*
                   Math.sin(dLon/2)*Math.sin(dLon/2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    }
}
