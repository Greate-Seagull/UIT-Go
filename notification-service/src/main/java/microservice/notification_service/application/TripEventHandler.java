package microservice.notification_service.application;

import microservice.notification_service.adapters.persistent.TripEventRepository;
import microservice.notification_service.domain.TripEventEntity;
import microservice.notification_service.domain.model.TripCancelledEvent;
import microservice.notification_service.domain.model.TripCreatedEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@Transactional
public class TripEventHandler {
    private static final Logger log = LoggerFactory.getLogger(TripEventHandler.class);

    private final NotificationService notificationService;
    private final TripEventRepository tripEventRepository;

    public TripEventHandler(NotificationService notificationService, TripEventRepository tripEventRepository) {
        this.notificationService = notificationService;
        this.tripEventRepository = tripEventRepository;
    }

    @RabbitListener(queues = "${notification.trip-created-queue}")
    public void handle(TripCreatedEvent event) {
        if (tripEventRepository.existsByEventId(event.eventId())) {
            log.warn("Received duplicate TripCreatedEvent with eventId: {}", event.eventId());
            return;
        }
        log.info("Received a TripCreatedEvent with tripId: {}", event.tripId());
        notificationService.sendTripCreatedNotification(event);
        var tripEvent = new TripEventEntity(event.eventId());
        tripEventRepository.save(tripEvent);
    }

    @RabbitListener(queues = "${notification.trip-cancelled-queue}")
    public void handle(TripCancelledEvent event) {
        if (tripEventRepository.existsByEventId(event.eventId())) {
            log.warn("Received duplicate TripCancelledEvent with eventId: {}", event.eventId());
            return;
        }
        log.info("Received a TripCancelledEvent with tripId: {}", event.tripId());
        notificationService.sendTripCancelledNotification(event);
        var tripEvent = new TripEventEntity(event.eventId());
        tripEventRepository.save(tripEvent);
    }
}
