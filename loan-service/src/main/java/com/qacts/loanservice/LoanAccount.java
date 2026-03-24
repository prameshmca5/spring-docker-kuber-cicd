package com.qacts.loanservice;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "loan_accounts")
public class LoanAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long customerId;
    private Long settlementAccountId;
    private String loanNumber;
    private String loanType;
    private Double principalAmount;
    private Double outstandingBalance;
    private Double interestRate;
    private Integer tenureMonths;
    private Double monthlyInstallment;
    private String status;
    private LocalDate startDate;
    private LocalDate maturityDate;
    private String purpose;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() {
        if (status == null || status.isBlank()) {
            status = "ACTIVE";
        }
        if (principalAmount == null) {
            principalAmount = 0.0;
        }
        if (outstandingBalance == null) {
            outstandingBalance = principalAmount;
        }
        if (interestRate == null) {
            interestRate = 4.5;
        }
        if (tenureMonths == null || tenureMonths <= 0) {
            tenureMonths = 12;
        }
        if (monthlyInstallment == null) {
            monthlyInstallment = tenureMonths == 0 ? principalAmount : principalAmount / tenureMonths;
        }
        if (startDate == null) {
            startDate = LocalDate.now();
        }
        if (maturityDate == null) {
            maturityDate = startDate.plusMonths(tenureMonths);
        }
        if (loanNumber == null || loanNumber.isBlank()) {
            loanNumber = "LN-" + System.currentTimeMillis();
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

    public Long getSettlementAccountId() {
        return settlementAccountId;
    }

    public void setSettlementAccountId(Long settlementAccountId) {
        this.settlementAccountId = settlementAccountId;
    }

    public String getLoanNumber() {
        return loanNumber;
    }

    public void setLoanNumber(String loanNumber) {
        this.loanNumber = loanNumber;
    }

    public String getLoanType() {
        return loanType;
    }

    public void setLoanType(String loanType) {
        this.loanType = loanType;
    }

    public Double getPrincipalAmount() {
        return principalAmount;
    }

    public void setPrincipalAmount(Double principalAmount) {
        this.principalAmount = principalAmount;
    }

    public Double getOutstandingBalance() {
        return outstandingBalance;
    }

    public void setOutstandingBalance(Double outstandingBalance) {
        this.outstandingBalance = outstandingBalance;
    }

    public Double getInterestRate() {
        return interestRate;
    }

    public void setInterestRate(Double interestRate) {
        this.interestRate = interestRate;
    }

    public Integer getTenureMonths() {
        return tenureMonths;
    }

    public void setTenureMonths(Integer tenureMonths) {
        this.tenureMonths = tenureMonths;
    }

    public Double getMonthlyInstallment() {
        return monthlyInstallment;
    }

    public void setMonthlyInstallment(Double monthlyInstallment) {
        this.monthlyInstallment = monthlyInstallment;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getMaturityDate() {
        return maturityDate;
    }

    public void setMaturityDate(LocalDate maturityDate) {
        this.maturityDate = maturityDate;
    }

    public String getPurpose() {
        return purpose;
    }

    public void setPurpose(String purpose) {
        this.purpose = purpose;
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
