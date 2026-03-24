package com.qacts.paymentservice;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "billers")
public class Biller {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long customerId;
    private String billerCode;
    private String billerName;
    private String category;
    private String referenceLabel;
    private String referenceValue;
    private String nickname;
    private String status;
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        if (status == null || status.isBlank()) {
            status = "ACTIVE";
        }
        createdAt = LocalDateTime.now();
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

    public String getBillerCode() {
        return billerCode;
    }

    public void setBillerCode(String billerCode) {
        this.billerCode = billerCode;
    }

    public String getBillerName() {
        return billerName;
    }

    public void setBillerName(String billerName) {
        this.billerName = billerName;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getReferenceLabel() {
        return referenceLabel;
    }

    public void setReferenceLabel(String referenceLabel) {
        this.referenceLabel = referenceLabel;
    }

    public String getReferenceValue() {
        return referenceValue;
    }

    public void setReferenceValue(String referenceValue) {
        this.referenceValue = referenceValue;
    }

    public String getNickname() {
        return nickname;
    }

    public void setNickname(String nickname) {
        this.nickname = nickname;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
