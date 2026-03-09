package com.qacts.notificationservice;

import jakarta.persistence.criteria.CriteriaBuilder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.annotation.EnableKafka;
import org.springframework.kafka.listener.ListenerExecutionFailedException;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.Message;
import org.springframework.context.annotation.Bean;

/**
 * Kafka Listener Configuration
 * Enables/disables Kafka listeners based on property: kafka.listener.enabled
 *
 * Features:
 * - Conditional enablement of @KafkaListener methods
 * - Global error handling for Kafka consumers
 * - Metrics and monitoring support
 */
@Configuration
@ConditionalOnProperty(
    name = "kafka.listener.enabled",
    havingValue = "true",
    matchIfMissing = true
)
@EnableKafka
public class KafkaListenerConfig {

    private static final Logger log = LoggerFactory.getLogger(KafkaListenerConfig.class);

    public KafkaListenerConfig() {
        log.info("KafkaListenerConfig initialized - Kafka listeners are ENABLED");
    }

    /**
     * Global error handler for Kafka listeners
     * Handles exceptions thrown by @KafkaListener methods
     */
    @Bean
    public org.springframework.kafka.listener.ConsumerAwareListenerErrorHandler kafkaListenerErrorHandler() {
        return (message, exception, consumer) -> {
            String topic = (String) message.getHeaders().get(KafkaHeaders.RECEIVED_TOPIC);
            //Integer partition = (Integer) message.getHeaders().get("kafka_receivedPartitionId");
            Integer partition = (Integer) message.getHeaders().get(KafkaHeaders.RECEIVED_PARTITION);
            Long offset = (Long) message.getHeaders().get(KafkaHeaders.OFFSET);

            log.error("Error in Kafka listener. Topic: {}, Partition: {}, Offset: {}, Error: {}",
                    topic, partition, offset, exception.getMessage(), exception);

            // Don't rethrow - allow consumer to continue processing
            // If you want to implement DLQ (Dead Letter Queue), do it here
            if (exception instanceof ListenerExecutionFailedException) {
                log.info("Kafka listener execution failed, continuing with next message");
            }

            return exception;
        };
    }
}

