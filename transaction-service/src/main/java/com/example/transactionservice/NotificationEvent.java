package com.example.transactionservice;

/**
 * Shared event DTO published to Kafka after a transaction is created.
 */
public record NotificationEvent(
        Long customerId,
        String eventType, // e.g. "TRANSACTION_CREATED"
        String message) {
}
