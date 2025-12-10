package microservice.notification_service.domain.model;

public record TripCancelledEvent(
        String eventId,
        String tripId,
        Customer customer,
        String reason) {
}
