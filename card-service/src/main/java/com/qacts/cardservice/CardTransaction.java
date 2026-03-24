package com.qacts.cardservice;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "card_transactions")
public class CardTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long cardId;
    private String merchantName;
    private String merchantCategory;
    private Double amount;
    private String currency;
    private LocalDateTime transactionDate;
    private String status;
    private String entryType;
    private String referenceNumber;

    @PrePersist
    void onCreate() {
        if (currency == null || currency.isBlank()) {
            currency = "MYR";
        }
        if (status == null || status.isBlank()) {
            status = "POSTED";
        }
        if (entryType == null || entryType.isBlank()) {
            entryType = "DEBIT";
        }
        if (transactionDate == null) {
            transactionDate = LocalDateTime.now();
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getCardId() {
        return cardId;
    }

    public void setCardId(Long cardId) {
        this.cardId = cardId;
    }

    public String getMerchantName() {
        return merchantName;
    }

    public void setMerchantName(String merchantName) {
        this.merchantName = merchantName;
    }

    public String getMerchantCategory() {
        return merchantCategory;
    }

    public void setMerchantCategory(String merchantCategory) {
        this.merchantCategory = merchantCategory;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public LocalDateTime getTransactionDate() {
        return transactionDate;
    }

    public void setTransactionDate(LocalDateTime transactionDate) {
        this.transactionDate = transactionDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getEntryType() {
        return entryType;
    }

    public void setEntryType(String entryType) {
        this.entryType = entryType;
    }

    public String getReferenceNumber() {
        return referenceNumber;
    }

    public void setReferenceNumber(String referenceNumber) {
        this.referenceNumber = referenceNumber;
    }
}
