package com.qacts.aifraud.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * Fraud Detection Result
 * Contains fraud score and risk assessment details
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FraudScore {

    private Long transactionId;

    private Long accountId;

    private Long customerId;

    private Double fraudScore; // 0.0 to 1.0

    private FraudRiskLevel riskLevel; // LOW, MEDIUM, HIGH, CRITICAL

    private String reason; // Why it was flagged

    private java.util.Map<String, Double> riskFactors; // Individual risk scores

    private LocalDateTime analyzedAt;

    private Boolean manualReview;

    private String approvalStatus; // APPROVED, BLOCKED, REVIEW_PENDING, FLAGGED

    public enum FraudRiskLevel {
        LOW(0.0, 0.3),
        MEDIUM(0.3, 0.7),
        HIGH(0.7, 0.85),
        CRITICAL(0.85, 1.0);

        public final double min;
        public final double max;

        FraudRiskLevel(double min, double max) {
            this.min = min;
            this.max = max;
        }

        public static FraudRiskLevel fromScore(double score) {
            if (score < 0.3) return LOW;
            if (score < 0.7) return MEDIUM;
            if (score < 0.85) return HIGH;
            return CRITICAL;
        }
    }

    public String getRecommendedAction() {
        return switch (riskLevel) {
            case LOW -> "APPROVE";
            case MEDIUM -> "REQUIRE_AUTHENTICATION";
            case HIGH -> "REQUIRE_MANUAL_REVIEW";
            case CRITICAL -> "BLOCK_TRANSACTION";
        };
    }
}

