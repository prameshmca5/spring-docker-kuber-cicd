package com.qacts.transactionservice;

import java.time.LocalDateTime;

public record TransferInstructionRequest(
        Long customerId,
        Long sourceAccountId,
        Long targetAccountId,
        String beneficiaryName,
        String beneficiaryAccountNumber,
        String beneficiaryBankCode,
        String destinationCountry,
        Double amount,
        String currency,
        String schedulePattern,
        LocalDateTime scheduledFor,
        String remarks
) {
}
