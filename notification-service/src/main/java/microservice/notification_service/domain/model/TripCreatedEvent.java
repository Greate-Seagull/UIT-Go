package microservice.notification_service.domain.model;

public record TripCreatedEvent(
        String eventId,
        String tripId,
        Customer customer,
        String origin,
        String destination,
        Double price) {
}
