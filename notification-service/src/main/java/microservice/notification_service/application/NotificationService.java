package microservice.notification_service.application;

import jakarta.mail.internet.MimeMessage;
import microservice.notification_service.config.ApplicationProperties;
import microservice.notification_service.domain.model.TripCancelledEvent;
import microservice.notification_service.domain.model.TripCreatedEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {
    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    private final JavaMailSender emailSender;
    private final ApplicationProperties properties;

    public NotificationService(JavaMailSender emailSender, ApplicationProperties properties) {
        this.emailSender = emailSender;
        this.properties = properties;
    }

    public void sendTripCreatedNotification(TripCreatedEvent event) {
        String message = """
                ===================================================
                Trip Created Notification
                ----------------------------------------------------
                Dear %s,
                Your trip request (ID: %s) has been created successfully.

                Details:
                Origin: %s
                Destination: %s
                Est. Price: %.2f

                Thanks,
                UIT-Go Team
                ===================================================
                """
                .formatted(event.customer().name(), event.tripId(), event.origin(), event.destination(), event.price());
        log.info("\n{}", message);
        sendEmail(event.customer().email(), "Trip Created Notification", message);
    }

    public void sendTripCancelledNotification(TripCancelledEvent event) {
        String message = """
                ===================================================
                Trip Cancelled Notification
                ----------------------------------------------------
                Dear %s,
                Your trip with ID: %s has been cancelled.
                Reason: %s

                Thanks,
                UIT-Go Team
                ===================================================
                """
                .formatted(event.customer().name(), event.tripId(), event.reason());
        log.info("\n{}", message);
        sendEmail(event.customer().email(), "Trip Cancelled Notification", message);
    }

    private void sendEmail(String recipient, String subject, String content) {
        try {
            MimeMessage mimeMessage = emailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "utf-8");
            helper.setFrom(properties.supportEmail());
            helper.setTo(recipient);
            helper.setSubject(subject);
            helper.setText(content);
            emailSender.send(mimeMessage);
            log.info("Email sent to: {}", recipient);
        } catch (Exception e) {
            log.error("Error while sending email to {}", recipient, e);
            // Don't throw exception to avoid infinite retry loops in some configs,
            // or throw if you want DLQ. For now I'll log.
            // But the user example threw RuntimeException. I'll stick to their pattern.
            throw new RuntimeException("Error while sending email", e);
        }
    }
}
