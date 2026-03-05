package com.example.notificationservice;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
public class NotificationKafkaListener {

    private static final Logger log = LoggerFactory.getLogger(NotificationKafkaListener.class);
    private final NotificationRepository notificationRepository;

    public NotificationKafkaListener(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @KafkaListener(topics = { "account.created", "transaction.created",
            "payment.created" }, groupId = "notification-group")
    public void handleNotificationEvent(NotificationEvent event) {
        log.info("Received Kafka Event: topic={}, customerId={}, eventType={}",
                event.eventType(), event.customerId(), event.eventType());

        // Resolve template by event type
        NotificationTemplate template = NotificationTemplate.fromEventType(event.eventType());

        // Build resolved message: use metadata placeholders if provided, fall back to
        // raw message
        String resolvedMessage = (event.metadata() != null && !event.metadata().isEmpty())
                ? template.resolve(event.metadata())
                : (event.message() != null ? event.message() : template.resolve(null));

        Notification notification = new Notification();
        notification.setCustomerId(event.customerId());
        notification.setEventType(event.eventType());
        notification.setTitle(template.getTitle());
        notification.setMessage(resolvedMessage);
        notification.setRead(false);

        notificationRepository.save(notification);
        log.info("Saved notification [{}] for customerId={}: title='{}', message='{}'",
                event.eventType(), event.customerId(), template.getTitle(), resolvedMessage);
    }
}
