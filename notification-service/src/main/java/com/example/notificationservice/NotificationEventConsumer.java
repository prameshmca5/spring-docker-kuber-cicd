package com.example.notificationservice;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
public class NotificationEventConsumer {

    private static final Logger log = LoggerFactory.getLogger(NotificationEventConsumer.class);

    private final NotificationRepository repository;

    public NotificationEventConsumer(NotificationRepository repository) {
        this.repository = repository;
    }

    @KafkaListener(topics = { "account.created", "transaction.created",
            "payment.created" }, groupId = "notification-group", containerFactory = "kafkaListenerContainerFactory")
    public void consume(NotificationEvent event) {
        log.info("Received Kafka event: type={} customerId={} message={}",
                event.eventType(), event.customerId(), event.message());
        try {
            Notification notification = new Notification();
            notification.setCustomerId(event.customerId());
            notification.setMessage(String.format("[%s] %s", event.eventType(), event.message()));
            Notification saved = repository.save(notification);
            log.info("Notification persisted with ID={} for customerId={}", saved.getId(), event.customerId());
        } catch (Exception ex) {
            log.error("Failed to persist notification for event type={} customerId={}: {}",
                    event.eventType(), event.customerId(), ex.getMessage(), ex);
        }
    }
}
