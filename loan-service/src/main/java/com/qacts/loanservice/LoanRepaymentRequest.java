package com.qacts.loanservice;

public record LoanRepaymentRequest(
        Double amount,
        String paymentChannel,
        String referenceNumber
) {
}
