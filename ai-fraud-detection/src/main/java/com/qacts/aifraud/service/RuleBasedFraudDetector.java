package com.qacts.aifraud.service;

import com.qacts.aifraud.model.FraudScore;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.*;

/**
 * Rule-based Fraud Detection Engine
 * Detects fraud using predefined rules and patterns
 */
@Service
@Slf4j
public class RuleBasedFraudDetector {

    // Thresholds
    private static final double DAILY_TRANSACTION_LIMIT = 100000.0;
    private static final double SINGLE_TRANSACTION_LIMIT = 50000.0;
    private static final int MAX_TRANSACTIONS_PER_HOUR = 10;
    private static final double VELOCITY_THRESHOLD = 5000.0; // Sum within 5 minutes

    /**
     * Detect fraud based on transaction rules
     */
    public FraudScore detectFraud(TransactionData txn, CustomerProfile customer) {
        log.info("Analyzing transaction {} for fraud patterns", txn.getId());

        Map<String, Double> riskFactors = new HashMap<>();
        double totalScore = 0.0;

        // Rule 1: Amount-based checks
        double amountScore = checkTransactionAmount(txn);
        riskFactors.put("transaction_amount", amountScore);
        totalScore += amountScore * 0.25;

        // Rule 2: Velocity checks
        double velocityScore = checkTransactionVelocity(txn, customer);
        riskFactors.put("transaction_velocity", velocityScore);
        totalScore += velocityScore * 0.20;

        // Rule 3: Merchant risk
        double merchantScore = checkMerchantRisk(txn);
        riskFactors.put("merchant_risk", merchantScore);
        totalScore += merchantScore * 0.15;

        // Rule 4: Geographic anomaly
        double geoScore = checkGeographicAnomaly(txn, customer);
        riskFactors.put("geographic_anomaly", geoScore);
        totalScore += geoScore * 0.15;

        // Rule 5: Time-based checks
        double timeScore = checkTimeBasedAnomaly(txn, customer);
        riskFactors.put("time_anomaly", timeScore);
        totalScore += timeScore * 0.10;

        // Rule 6: Device fingerprint
        double deviceScore = checkDeviceAnomaly(txn, customer);
        riskFactors.put("device_anomaly", deviceScore);
        totalScore += deviceScore * 0.10;

        double normalizedScore = Math.min(1.0, Math.max(0.0, totalScore));

        String reason = generateReason(riskFactors, normalizedScore);

        return FraudScore.builder()
            .transactionId(txn.getId())
            .accountId(txn.getAccountId())
            .customerId(txn.getCustomerId())
            .fraudScore(normalizedScore)
            .riskLevel(FraudScore.FraudRiskLevel.fromScore(normalizedScore))
            .reason(reason)
            .riskFactors(riskFactors)
            .analyzedAt(LocalDateTime.now())
            .approvalStatus(getApprovalStatus(normalizedScore))
            .build();
    }

    /**
     * Check if transaction amount is suspicious
     */
    private double checkTransactionAmount(TransactionData txn) {
        double score = 0.0;

        if (txn.getAmount() > SINGLE_TRANSACTION_LIMIT) {
            score += 0.5; // Unusual amount
        }

        if (txn.getAmount() > SINGLE_TRANSACTION_LIMIT * 2) {
            score += 0.3; // Extremely high amount
        }

        return Math.min(1.0, score);
    }

    /**
     * Check transaction velocity (frequency and amount)
     */
    private double checkTransactionVelocity(TransactionData txn, CustomerProfile customer) {
        double score = 0.0;

        // Check number of transactions in the last hour
        int txnsLastHour = customer.getRecentTransactionCount(60);
        if (txnsLastHour > MAX_TRANSACTIONS_PER_HOUR) {
            score += (double) (txnsLastHour - MAX_TRANSACTIONS_PER_HOUR) / 5 * 0.5;
        }

        // Check amount in last 5 minutes
        double amountLast5Min = customer.getRecentTransactionAmount(5);
        if (amountLast5Min > VELOCITY_THRESHOLD) {
            score += Math.min(0.5, (amountLast5Min - VELOCITY_THRESHOLD) / VELOCITY_THRESHOLD * 0.5);
        }

        return Math.min(1.0, score);
    }

    /**
     * Check merchant risk (high-risk merchants)
     */
    private double checkMerchantRisk(TransactionData txn) {
        // In production, use a merchant risk database
        Set<String> highRiskMerchants = Set.of("CASINO", "CRYPTO", "MONEY_LENDER");

        if (highRiskMerchants.contains(txn.getMerchantCategory())) {
            return 0.4;
        }

        // Check if new merchant for customer
        if (!txn.isRecurringMerchant()) {
            return 0.2;
        }

        return 0.0;
    }

    /**
     * Check for geographic anomalies
     */
    private double checkGeographicAnomaly(TransactionData txn, CustomerProfile customer) {
        double score = 0.0;

        // Check if transaction is from a different country
        if (!txn.getCountry().equals(customer.getHomeCountry())) {
            score += 0.3;
        }

        // Check if transaction is from unusual location
        if (customer.isUnusualLocation(txn.getCountry())) {
            score += 0.2;
        }

        return Math.min(1.0, score);
    }

    /**
     * Check for time-based anomalies
     */
    private double checkTimeBasedAnomaly(TransactionData txn, CustomerProfile customer) {
        double score = 0.0;
        int hour = txn.getTimestamp().getHour();

        // Check if transaction is outside usual hours
        if (!customer.isUsualTransactionTime(hour)) {
            score += 0.3;
        }

        // Check if weekend or holiday
        if (txn.isWeekendOrHoliday()) {
            score += 0.1;
        }

        return Math.min(1.0, score);
    }

    /**
     * Check for device anomalies
     */
    private double checkDeviceAnomaly(TransactionData txn, CustomerProfile customer) {
        double score = 0.0;

        // Check if new device
        if (!customer.isKnownDevice(txn.getDeviceId())) {
            score += 0.4;
        }

        // Check if suspicious device behavior
        if (customer.isCompromisedDevice(txn.getDeviceId())) {
            score += 0.3;
        }

        return Math.min(1.0, score);
    }

    /**
     * Generate human-readable reason for fraud score
     */
    private String generateReason(Map<String, Double> riskFactors, double score) {
        StringBuilder reason = new StringBuilder();

        riskFactors.entrySet().stream()
            .filter(e -> e.getValue() > 0.2)
            .sorted((a, b) -> Double.compare(b.getValue(), a.getValue()))
            .forEach(e -> {
                if (reason.length() > 0) reason.append(", ");
                reason.append(e.getKey()).append("(").append(String.format("%.2f", e.getValue())).append(")");
            });

        return reason.length() > 0 ? reason.toString() : "Low risk transaction";
    }

    /**
     * Get approval status based on fraud score
     */
    private String getApprovalStatus(double score) {
        FraudScore.FraudRiskLevel level = FraudScore.FraudRiskLevel.fromScore(score);
        return switch (level) {
            case LOW -> "APPROVED";
            case MEDIUM -> "REVIEW_PENDING";
            case HIGH -> "REVIEW_PENDING";
            case CRITICAL -> "BLOCKED";
        };
    }

    // Inner classes for data structures
    public static class TransactionData {
        private Long id;
        private Long accountId;
        private Long customerId;
        private Double amount;
        private String merchantCategory;
        private String country;
        private LocalDateTime timestamp;
        private String deviceId;

        // Getters
        public Long getId() { return id; }
        public Long getAccountId() { return accountId; }
        public Long getCustomerId() { return customerId; }
        public Double getAmount() { return amount; }
        public String getMerchantCategory() { return merchantCategory; }
        public String getCountry() { return country; }
        public LocalDateTime getTimestamp() { return timestamp; }
        public String getDeviceId() { return deviceId; }
        public boolean isRecurringMerchant() { return false; } // TODO: Implement
        public boolean isWeekendOrHoliday() { return false; } // TODO: Implement
    }

    public static class CustomerProfile {
        private String homeCountry;

        public int getRecentTransactionCount(int minutes) { return 0; } // TODO: Implement
        public double getRecentTransactionAmount(int minutes) { return 0.0; } // TODO: Implement
        public String getHomeCountry() { return homeCountry; }
        public boolean isUnusualLocation(String country) { return false; } // TODO: Implement
        public boolean isUsualTransactionTime(int hour) { return true; } // TODO: Implement
        public boolean isKnownDevice(String deviceId) { return false; } // TODO: Implement
        public boolean isCompromisedDevice(String deviceId) { return false; } // TODO: Implement
    }
}

