package com.qacts.notificationservice;

import java.util.Map;

/**
 * Template registry mapping eventType → (title, messageTemplate).
 * Use {placeholder} syntax in the template; values come from event metadata.
 */
public enum NotificationTemplate {

    PAYMENT_CREATED(
            "Payment Processed",
            "Your payment of {amount} has been processed successfully. Reference: {paymentId}."),
    ACCOUNT_CREATED(
            "Account Opened",
            "Welcome! Your new account ({accountId}) has been successfully created."),
    TRANSACTION_CREATED(
            "Transaction Recorded",
            "A transaction of {amount} has been recorded on your account ({accountId})."),
    EMPLOYEE_JOINED(
            "New Team Member",
            "Employee {name} has joined the team in department {department}."),
    TRANSFER_COMPLETED(
            "Transfer Completed",
            "Your transfer of {amount} to account {targetAccount} was completed successfully."),
    GENERIC(
            "Notification",
            "{message}");

    private final String title;
    private final String messageTemplate;

    NotificationTemplate(String title, String messageTemplate) {
        this.title = title;
        this.messageTemplate = messageTemplate;
    }

    public String getTitle() {
        return title;
    }

    /**
     * Resolves the message template by substituting all {key} placeholders
     * with values from the provided metadata map.
     */
    public String resolve(Map<String, String> metadata) {
        if (metadata == null || metadata.isEmpty()) {
            return messageTemplate;
        }
        String result = messageTemplate;
        for (Map.Entry<String, String> entry : metadata.entrySet()) {
            result = result.replace("{" + entry.getKey() + "}", entry.getValue());
        }
        return result;
    }

    /**
     * Finds a template by eventType string, falling back to GENERIC if not found.
     */
    public static NotificationTemplate fromEventType(String eventType) {
        if (eventType == null)
            return GENERIC;
        try {
            return valueOf(eventType.toUpperCase());
        } catch (IllegalArgumentException e) {
            return GENERIC;
        }
    }
}
