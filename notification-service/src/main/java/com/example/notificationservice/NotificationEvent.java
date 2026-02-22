package com.example.notificationservice;

/**
 * Event DTO received from Kafka topics:
 * - account.created
 * - transaction.created
 * - payment.created
 *
 * Must match the NotificationEvent record shape in each producer service.
 */
public record NotificationEvent(
        Long customerId,
        String eventType,
        String message) {
}
