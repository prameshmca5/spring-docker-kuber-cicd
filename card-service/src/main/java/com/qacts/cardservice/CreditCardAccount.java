package com.qacts.cardservice;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "credit_cards")
public class CreditCardAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long customerId;
    private Long linkedAccountId;
    private String cardNumberMasked;
    private String cardHolderName;
    private String cardType;
    private String currency;
    private String status;
    private Double creditLimit;
    private Double availableLimit;
    private Double outstandingBalance;
    private LocalDate paymentDueDate;
    private LocalDate statementDate;
    private Boolean internationalEnabled;
    private Boolean onlineEnabled;
    private Boolean cashAdvanceEnabled;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() {
        if (currency == null || currency.isBlank()) {
            currency = "MYR";
        }
        if (status == null || status.isBlank()) {
            status = "ACTIVE";
        }
        if (outstandingBalance == null) {
            outstandingBalance = 0.0;
        }
        if (creditLimit == null) {
            creditLimit = 0.0;
        }
        if (availableLimit == null) {
            availableLimit = Math.max(0.0, creditLimit - outstandingBalance);
        }
        if (internationalEnabled == null) {
            internationalEnabled = Boolean.TRUE;
        }
        if (onlineEnabled == null) {
            onlineEnabled = Boolean.TRUE;
        }
        if (cashAdvanceEnabled == null) {
            cashAdvanceEnabled = Boolean.FALSE;
        }
        if (statementDate == null) {
            statementDate = LocalDate.now().plusDays(15);
        }
        if (paymentDueDate == null) {
            paymentDueDate = LocalDate.now().plusDays(25);
        }
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public Long getLinkedAccountId() {
        return linkedAccountId;
    }

    public void setLinkedAccountId(Long linkedAccountId) {
        this.linkedAccountId = linkedAccountId;
    }

    public String getCardNumberMasked() {
        return cardNumberMasked;
    }

    public void setCardNumberMasked(String cardNumberMasked) {
        this.cardNumberMasked = cardNumberMasked;
    }

    public String getCardHolderName() {
        return cardHolderName;
    }

    public void setCardHolderName(String cardHolderName) {
        this.cardHolderName = cardHolderName;
    }

    public String getCardType() {
        return cardType;
    }

    public void setCardType(String cardType) {
        this.cardType = cardType;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Double getCreditLimit() {
        return creditLimit;
    }

    public void setCreditLimit(Double creditLimit) {
        this.creditLimit = creditLimit;
    }

    public Double getAvailableLimit() {
        return availableLimit;
    }

    public void setAvailableLimit(Double availableLimit) {
        this.availableLimit = availableLimit;
    }

    public Double getOutstandingBalance() {
        return outstandingBalance;
    }

    public void setOutstandingBalance(Double outstandingBalance) {
        this.outstandingBalance = outstandingBalance;
    }

    public LocalDate getPaymentDueDate() {
        return paymentDueDate;
    }

    public void setPaymentDueDate(LocalDate paymentDueDate) {
        this.paymentDueDate = paymentDueDate;
    }

    public LocalDate getStatementDate() {
        return statementDate;
    }

    public void setStatementDate(LocalDate statementDate) {
        this.statementDate = statementDate;
    }

    public Boolean getInternationalEnabled() {
        return internationalEnabled;
    }

    public void setInternationalEnabled(Boolean internationalEnabled) {
        this.internationalEnabled = internationalEnabled;
    }

    public Boolean getOnlineEnabled() {
        return onlineEnabled;
    }

    public void setOnlineEnabled(Boolean onlineEnabled) {
        this.onlineEnabled = onlineEnabled;
    }

    public Boolean getCashAdvanceEnabled() {
        return cashAdvanceEnabled;
    }

    public void setCashAdvanceEnabled(Boolean cashAdvanceEnabled) {
        this.cashAdvanceEnabled = cashAdvanceEnabled;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
