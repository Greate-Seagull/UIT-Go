package com.uitgo.trip.config;

import io.swagger.v3.oas.models.ExternalDocumentation;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Trip API")
                        .description("API documentation for trip service")
                        .version("v1.0")
                        .license(new License().name("MIT License"))
                )
                .externalDocs(new ExternalDocumentation()
                        .description("Project GitHub")
                        .url(""));
    }
}
