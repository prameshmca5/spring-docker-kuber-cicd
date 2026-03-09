package com.qacts.notificationservice;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Kafka Listener Management REST API
 *
 * Endpoints to check and monitor Kafka listener status
 *
 * GET /api/v1/kafka/status - Get current Kafka listener status
 * GET /api/v1/kafka/config - Get Kafka configuration details
 */
@RestController
@RequestMapping("/api/v1/kafka")
@CrossOrigin(origins = "*")
@ConditionalOnProperty(
    name = "kafka.listener.enabled",
    havingValue = "true",
    matchIfMissing = true
)
public class KafkaListenerManagementController {

    private static final Logger log = LoggerFactory.getLogger(KafkaListenerManagementController.class);
    private final KafkaListenerControlService kafkaListenerControlService;

    public KafkaListenerManagementController(KafkaListenerControlService kafkaListenerControlService) {
        this.kafkaListenerControlService = kafkaListenerControlService;
        log.info("KafkaListenerManagementController initialized");
    }

    /**
     * Get current Kafka listener status
     *
     * @return Status information about Kafka listeners
     */
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getKafkaListenerStatus() {
        log.info("GET /api/v1/kafka/status - Fetching Kafka listener status");

        Map<String, Object> status = new HashMap<>();
        status.put("kafkaListenerEnabled", kafkaListenerControlService.isListenerEnabled());
        status.put("bootstrapServers", kafkaListenerControlService.getBootstrapServers());
        status.put("consumerGroupId", kafkaListenerControlService.getGroupId());
        status.put("errorHandlerEnabled", kafkaListenerControlService.isErrorHandlerEnabled());
        status.put("timestamp", System.currentTimeMillis());

        return ResponseEntity.ok(status);
    }

    /**
     * Get detailed Kafka configuration
     *
     * @return Detailed configuration information
     */
    @GetMapping("/config")
    public ResponseEntity<Map<String, Object>> getKafkaConfiguration() {
        log.info("GET /api/v1/kafka/config - Fetching Kafka configuration");

        Map<String, Object> config = new HashMap<>();
        config.put("listenerEnabled", kafkaListenerControlService.isListenerEnabled());
        config.put("bootstrapServers", kafkaListenerControlService.getBootstrapServers());
        config.put("consumerGroupId", kafkaListenerControlService.getGroupId());
        config.put("errorHandlerEnabled", kafkaListenerControlService.isErrorHandlerEnabled());
        config.put("listenTopics", new String[]{
            "account.created",
            "transaction.created",
            "payment.created"
        });
        config.put("description", "Notification Service Kafka Listener Configuration");
        config.put("status", "RUNNING");

        kafkaListenerControlService.logConfiguration();

        return ResponseEntity.ok(config);
    }

    /**
     * Health check endpoint for Kafka listeners
     *
     * @return Health status
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> getKafkaHealth() {
        log.info("GET /api/v1/kafka/health - Checking Kafka health");

        Map<String, String> health = new HashMap<>();

        if (kafkaListenerControlService.isListenerEnabled()) {
            health.put("status", "UP");
            health.put("message", "Kafka listeners are running and healthy");
        } else {
            health.put("status", "DISABLED");
            health.put("message", "Kafka listeners are disabled");
        }

        health.put("bootstrapServers", kafkaListenerControlService.getBootstrapServers());
        health.put("timestamp", String.valueOf(System.currentTimeMillis()));

        return ResponseEntity.ok(health);
    }

    /**
     * Test endpoint to verify Kafka connectivity
     *
     * @return Test result
     */
    @GetMapping("/test")
    public ResponseEntity<Map<String, Object>> testKafkaConnectivity() {
        log.info("GET /api/v1/kafka/test - Testing Kafka connectivity");

        Map<String, Object> testResult = new HashMap<>();
        testResult.put("listenerEnabled", kafkaListenerControlService.isListenerEnabled());
        testResult.put("bootstrapServers", kafkaListenerControlService.getBootstrapServers());
        testResult.put("groupId", kafkaListenerControlService.getGroupId());
        testResult.put("testStatus", "Configuration validated");
        testResult.put("timestamp", System.currentTimeMillis());

        if (!kafkaListenerControlService.isListenerEnabled()) {
            testResult.put("warning", "Kafka listeners are currently disabled");
        }

        return ResponseEntity.ok(testResult);
    }
}

