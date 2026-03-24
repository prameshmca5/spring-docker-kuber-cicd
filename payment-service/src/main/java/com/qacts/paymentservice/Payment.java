package com.qacts.paymentservice;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
public class Payment {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long accountId;
    private Long customerId;
    private Long billerId;
    private Double amount;
    private String paymentType;
    private String payeeName;
    private String paymentReference;
    private String status;
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        if (paymentType == null || paymentType.isBlank()) {
            paymentType = "CARD_PAYMENT";
        }
        if (status == null || status.isBlank()) {
            status = "COMPLETED";
        }
        createdAt = LocalDateTime.now();
    }

    public Payment() {}
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getAccountId() { return accountId; }
    public void setAccountId(Long accountId) { this.accountId = accountId; }
    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }
    public Long getBillerId() { return billerId; }
    public void setBillerId(Long billerId) { this.billerId = billerId; }
    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }
    public String getPaymentType() { return paymentType; }
    public void setPaymentType(String paymentType) { this.paymentType = paymentType; }
    public String getPayeeName() { return payeeName; }
    public void setPayeeName(String payeeName) { this.payeeName = payeeName; }
    public String getPaymentReference() { return paymentReference; }
    public void setPaymentReference(String paymentReference) { this.paymentReference = paymentReference; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
