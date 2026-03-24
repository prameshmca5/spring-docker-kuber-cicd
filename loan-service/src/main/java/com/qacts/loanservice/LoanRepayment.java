package com.qacts.loanservice;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "loan_repayments")
public class LoanRepayment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long loanId;
    private Double amount;
    private Double principalComponent;
    private Double interestComponent;
    private Double feeComponent;
    private LocalDateTime paymentDate;
    private String paymentChannel;
    private String status;
    private String referenceNumber;

    @PrePersist
    void onCreate() {
        if (paymentDate == null) {
            paymentDate = LocalDateTime.now();
        }
        if (paymentChannel == null || paymentChannel.isBlank()) {
            paymentChannel = "ONLINE_BANKING";
        }
        if (status == null || status.isBlank()) {
            status = "COMPLETED";
        }
        if (feeComponent == null) {
            feeComponent = 0.0;
        }
        if (referenceNumber == null || referenceNumber.isBlank()) {
            referenceNumber = "LR-" + System.currentTimeMillis();
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getLoanId() {
        return loanId;
    }

    public void setLoanId(Long loanId) {
        this.loanId = loanId;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public Double getPrincipalComponent() {
        return principalComponent;
    }

    public void setPrincipalComponent(Double principalComponent) {
        this.principalComponent = principalComponent;
    }

    public Double getInterestComponent() {
        return interestComponent;
    }

    public void setInterestComponent(Double interestComponent) {
        this.interestComponent = interestComponent;
    }

    public Double getFeeComponent() {
        return feeComponent;
    }

    public void setFeeComponent(Double feeComponent) {
        this.feeComponent = feeComponent;
    }

    public LocalDateTime getPaymentDate() {
        return paymentDate;
    }

    public void setPaymentDate(LocalDateTime paymentDate) {
        this.paymentDate = paymentDate;
    }

    public String getPaymentChannel() {
        return paymentChannel;
    }

    public void setPaymentChannel(String paymentChannel) {
        this.paymentChannel = paymentChannel;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getReferenceNumber() {
        return referenceNumber;
    }

    public void setReferenceNumber(String referenceNumber) {
        this.referenceNumber = referenceNumber;
    }
}
