package com.qacts.accountservice;

import java.time.LocalDate;

public record StandingOrderStatusRequest(
        String status,
        LocalDate nextExecutionDate
) {
}
