package com.uitgo.trip.config;

import feign.Logger;
import feign.Request;
import feign.Retryer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.TimeUnit;

@Configuration
public class DriverFeignConfig {

    @Bean
    public Request.Options feignOptions() {
        return new Request.Options(
                1, TimeUnit.SECONDS,
                1500, TimeUnit.MILLISECONDS,
                true
        );
    }

    @Bean
    public Retryer feignRetryer() {
        return Retryer.NEVER_RETRY;
    }

    @Bean
    public Logger.Level feignLoggerLevel() {
        return Logger.Level.BASIC;
    }
}
