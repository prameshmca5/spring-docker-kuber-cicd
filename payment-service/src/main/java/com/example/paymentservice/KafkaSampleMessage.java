package com.example.paymentservice;

import java.time.LocalDateTime;

public record KafkaSampleMessage(
        String id,
        String content,
        String timestamp) {
    public static KafkaSampleMessage create(String content) {
        return new KafkaSampleMessage(
                java.util.UUID.randomUUID().toString(),
                content,
                LocalDateTime.now().toString());
    }
}
