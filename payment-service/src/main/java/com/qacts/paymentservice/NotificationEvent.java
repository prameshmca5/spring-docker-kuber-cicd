package com.qacts.paymentservice;

import java.util.Map;

/**
 * Shared event DTO published to Kafka after a payment is created.
 * metadata carries template variables, e.g. amount, paymentId.
 */
public record NotificationEvent(
                Long customerId,
                String eventType,
                String message,
                Map<String, String> metadata) {
}
