package com.qacts.aicore.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Registry for trained ML models
 * Tracks model versions, performance metrics, and deployment status
 */
@Entity
@Table(name = "model_registry")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ModelMetadata {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String modelName;

    @Column(nullable = false)
    private String modelVersion;

    @Enumerated(EnumType.STRING)
    private ModelType modelType;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String modelPath;

    @Column(nullable = false)
    private String modelFormat; // ONNX, TensorFlow, PyTorch, Pickle, etc.

    @Column(nullable = false)
    private Double accuracy;

    @Column(nullable = false)
    private Double precision;

    @Column(nullable = false)
    private Double recall;

    @Column(nullable = false)
    private Double f1Score;

    @Enumerated(EnumType.STRING)
    private ModelStatus status; // TRAINING, VALIDATED, ACTIVE, DEPRECATED

    @Column(nullable = false)
    private LocalDateTime createdAt;

    private LocalDateTime deployedAt;

    private LocalDateTime deprecatedAt;

    @Column(nullable = false)
    private String createdBy;

    private Integer totalPredictions = 0;

    private Integer correctPredictions = 0;

    private LocalDateTime lastPredictionTime;

    public enum ModelType {
        FRAUD_DETECTION,
        CREDIT_SCORING,
        CHURN_PREDICTION,
        DEFAULT_RISK,
        RECOMMENDATION,
        ANOMALY_DETECTION
    }

    public enum ModelStatus {
        TRAINING,
        VALIDATED,
        ACTIVE,
        DEPRECATED,
        FAILED
    }

    public Double getCurrentAccuracy() {
        if (totalPredictions == 0) return accuracy;
        return (double) correctPredictions / totalPredictions;
    }
}

