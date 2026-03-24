package com.qacts.paymentservice;

import java.time.LocalDate;

public record ScheduledPaymentStatusRequest(
        String status,
        LocalDate nextExecutionDate
) {
}
