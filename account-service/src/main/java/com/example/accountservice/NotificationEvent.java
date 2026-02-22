package com.example.accountservice;

/**
 * Shared event DTO published to Kafka after an account is created.
 * Consumed by notification-service to generate a notification.
 */
public record NotificationEvent(
        Long customerId,
        String eventType, // e.g. "ACCOUNT_CREATED"
        String message // human-readable summary
) {
}
