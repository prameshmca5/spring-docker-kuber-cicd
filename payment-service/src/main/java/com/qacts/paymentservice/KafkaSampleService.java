package com.qacts.paymentservice;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Collections;

@Service
public class KafkaSampleService {

    private static final Logger log = LoggerFactory.getLogger(KafkaSampleService.class);
    private static final String TOPIC = "sample.topic";

    private final KafkaTemplate<String, Object> kafkaTemplate;

    // In-memory store for demo purposes
    private final List<KafkaSampleMessage> receivedMessages = Collections.synchronizedList(new ArrayList<>());

    public KafkaSampleService(KafkaTemplate<String, Object> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void publishMessage(String content) {
        KafkaSampleMessage message = KafkaSampleMessage.create(content);
        log.info("Publishing KafkaSampleMessage ID {} to topic {}", message.id(), TOPIC);
        kafkaTemplate.send(TOPIC, message.id(), message);
    }

    @KafkaListener(topics = TOPIC, groupId = "payment-sample-group")
    public void consumeMessage(KafkaSampleMessage message) {
        log.info("Received KafkaSampleMessage ID {} from topic {}", message.id(), TOPIC);
        // Keep the last 50 messages to prevent memory leak in demo
        if (receivedMessages.size() >= 50) {
            receivedMessages.remove(0);
        }
        receivedMessages.add(message);
    }

    public List<KafkaSampleMessage> getReceivedMessages() {
        return new ArrayList<>(receivedMessages);
    }
}
