package com.uitgo.trip.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.*;

@Configuration
public class ExecutorConfig {
    @Bean(name = "sseScheduler")
    public ScheduledExecutorService sseScheduler() {
        return Executors.newScheduledThreadPool(2);
    }
}
