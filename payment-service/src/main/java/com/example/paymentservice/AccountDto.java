package com.example.paymentservice;

public record AccountDto(
        Long id,
        Long customerId,
        Double balance,
        String accountType) {
}
