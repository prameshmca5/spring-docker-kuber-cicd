package com.qacts.paymentservice;

public record AccountDto(
        Long id,
        Long customerId,
        Double balance,
        String accountType) {
}
