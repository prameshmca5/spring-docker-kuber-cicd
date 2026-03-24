package com.qacts.transactionservice;

import java.time.LocalDateTime;

public record TransferScheduleUpdateRequest(
        String status,
        String schedulePattern,
        LocalDateTime scheduledFor
) {
}
