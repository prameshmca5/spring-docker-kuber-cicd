package com.qacts.cardservice;

public record CardControlUpdateRequest(
        Boolean internationalEnabled,
        Boolean onlineEnabled,
        Boolean cashAdvanceEnabled,
        String status
) {
}
