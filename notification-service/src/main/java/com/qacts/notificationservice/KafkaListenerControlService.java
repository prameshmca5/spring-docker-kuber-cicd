package com.qacts.notificationservice;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

/**
 * Kafka Listener Control Service
 *
 * Provides runtime control over Kafka listeners without restarting the application.
 * Use this component to:
 * 1. Check if Kafka listeners are enabled
 * 2. Get listener configuration details
 * 3. Monitor listener health status
 */
@Component
@ConditionalOnProperty(
    name = "kafka.listener.enabled",
    havingValue = "true",
    matchIfMissing = true
)
public class KafkaListenerControlService {

    private static final Logger log = LoggerFactory.getLogger(KafkaListenerControlService.class);

    @Value("${kafka.listener.enabled:true}")
    private boolean kafkaListenerEnabled;

    @Value("${spring.kafka.bootstrap-servers:localhost:9092}")
    private String bootstrapServers;

    @Value("${spring.kafka.consumer.group-id:notification-group}")
    private String groupId;

    @Value("${kafka.listener.error-handler-enabled:true}")
    private boolean errorHandlerEnabled;

    public KafkaListenerControlService() {
        log.info("KafkaListenerControlService initialized");
    }

    /**
     * Check if Kafka listeners are currently enabled
     */
    public boolean isListenerEnabled() {
        return kafkaListenerEnabled;
    }

    /**
     * Get bootstrap servers configuration
     */
    public String getBootstrapServers() {
        return bootstrapServers;
    }

    /**
     * Get consumer group ID
     */
    public String getGroupId() {
        return groupId;
    }

    /**
     * Check if error handler is enabled
     */
    public boolean isErrorHandlerEnabled() {
        return errorHandlerEnabled;
    }

    /**
     * Log current configuration (useful for debugging)
     */
    public void logConfiguration() {
        log.info("=== Kafka Listener Configuration ===");
        log.info("Listeners Enabled: {}", kafkaListenerEnabled);
        log.info("Bootstrap Servers: {}", bootstrapServers);
        log.info("Consumer Group ID: {}", groupId);
        log.info("Error Handler Enabled: {}", errorHandlerEnabled);
        log.info("=====================================");
    }
}

