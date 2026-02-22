package com.example.paymentservice;

/**
 * Shared event DTO published to Kafka after a payment is created.
 */
public record NotificationEvent(
        Long customerId,
        String eventType, // e.g. "PAYMENT_CREATED"
        String message) {
}
