package com.qacts.loanservice;

import java.time.LocalDate;

public record LoanScheduleItem(
        Integer installmentNumber,
        LocalDate dueDate,
        Double installmentAmount,
        Double projectedOutstandingBalance
) {
}
