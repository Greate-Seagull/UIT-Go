package microservice.notification_service.adapters.persistent;

import microservice.notification_service.domain.TripEventEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TripEventRepository extends JpaRepository<TripEventEntity, String> {
    boolean existsByEventId(String eventId);
}
