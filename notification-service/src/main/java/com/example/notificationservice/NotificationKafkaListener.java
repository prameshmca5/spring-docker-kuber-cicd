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
        log.info("Received Kafka Event: topic={}, customerId={}, message={}",
                event.eventType(), event.customerId(), event.message());

        Notification notification = new Notification();
        notification.setCustomerId(event.customerId());
        notification.setMessage(event.message());

        notificationRepository.save(notification);
        log.info("Saved notification to database for customer ID: {}", event.customerId());
    }
}
