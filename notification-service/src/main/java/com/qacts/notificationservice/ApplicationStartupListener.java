package com.qacts.notificationservice;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

/**
 * Application Startup Event Listener
 *
 * Demonstrates how to use KafkaListenerControlService
 * to log Kafka configuration during application startup
 */
@Component
@ConditionalOnProperty(
    name = "kafka.listener.enabled",
    havingValue = "true",
    matchIfMissing = true
)
public class ApplicationStartupListener {

    private static final Logger log = LoggerFactory.getLogger(ApplicationStartupListener.class);
    private final KafkaListenerControlService kafkaListenerControlService;

    public ApplicationStartupListener(KafkaListenerControlService kafkaListenerControlService) {
        this.kafkaListenerControlService = kafkaListenerControlService;
    }

    /**
     * Called when application has finished starting
     * Logs Kafka configuration status
     */
    @EventListener(ApplicationReadyEvent.class)
    public void onApplicationReady() {
        log.info("========================================");
        log.info("  APPLICATION STARTUP - KAFKA STATUS");
        log.info("========================================");

        kafkaListenerControlService.logConfiguration();

        if (kafkaListenerControlService.isListenerEnabled()) {
            log.info("✓ Kafka listeners are ENABLED");
            log.info("✓ Topics: account.created, transaction.created, payment.created");
            log.info("✓ Consumer Group: {}", kafkaListenerControlService.getGroupId());
            log.info("✓ Bootstrap Servers: {}", kafkaListenerControlService.getBootstrapServers());
            log.info("✓ Error Handler: {}",
                    kafkaListenerControlService.isErrorHandlerEnabled() ? "ENABLED" : "DISABLED");
        } else {
            log.warn("✗ Kafka listeners are DISABLED");
            log.warn("✗ No Kafka messages will be processed");
            log.warn("✗ To enable, set: kafka.listener.enabled=true");
        }

        log.info("========================================");
        log.info("  REST API Available at:");
        log.info("  - GET /api/v1/kafka/status");
        log.info("  - GET /api/v1/kafka/config");
        log.info("  - GET /api/v1/kafka/health");
        log.info("  - GET /api/v1/kafka/test");
        log.info("========================================");
    }
}
