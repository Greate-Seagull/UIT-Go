package com.uitgo.trip.config;

import feign.Logger;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FeignCfg {
    @Bean
    Logger.Level feignLoggerLevel() { return Logger.Level.BASIC; }
}
