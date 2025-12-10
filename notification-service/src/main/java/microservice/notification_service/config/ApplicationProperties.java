package microservice.notification_service.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "notification")
public record ApplicationProperties(
        String tripCreatedQueue,
        String tripCancelledQueue,
        String tripEventsExchange,
        String supportEmail) {
}
