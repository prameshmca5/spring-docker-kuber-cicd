package com.qacts.aicore.service;

import com.qacts.aicore.model.ModelMetadata;
import com.qacts.aicore.registry.ModelRegistry;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * Model Registry & Loading Service
 * Manages model versioning, loading, and caching
 */
@Service
@Slf4j
public class ModelLoaderService {

    private final ModelRegistry modelRegistry;
    private final Map<String, Object> modelCache = new HashMap<>();

    public ModelLoaderService(ModelRegistry modelRegistry) {
        this.modelRegistry = modelRegistry;
    }

    /**
     * Load active model by name
     */
    @Cacheable(value = "models", key = "#modelName")
    public Optional<Object> loadActiveModel(String modelName) {
        log.info("Loading active model: {}", modelName);

        Optional<ModelMetadata> metadata = modelRegistry
            .findByModelNameAndStatus(modelName, ModelMetadata.ModelStatus.ACTIVE);

        if (metadata.isEmpty()) {
            log.warn("No active model found for: {}", modelName);
            return Optional.empty();
        }

        return loadModelFromPath(metadata.get());
    }

    /**
     * Load specific model version
     */
    public Optional<Object> loadModelVersion(String modelName, String version) {
        log.info("Loading model version: {} v{}", modelName, version);

        Optional<ModelMetadata> metadata = modelRegistry
            .findByModelNameAndModelVersion(modelName, version);

        if (metadata.isEmpty()) {
            log.warn("Model not found: {} v{}", modelName, version);
            return Optional.empty();
        }

        return loadModelFromPath(metadata.get());
    }

    /**
     * Register a new model
     */
    public ModelMetadata registerModel(
            String modelName,
            String version,
            ModelMetadata.ModelType modelType,
            String modelPath,
            String modelFormat,
            Double accuracy,
            Double precision,
            Double recall,
            Double f1Score,
            String createdBy) {

        log.info("Registering model: {} v{}", modelName, version);

        ModelMetadata metadata = ModelMetadata.builder()
            .modelName(modelName)
            .modelVersion(version)
            .modelType(modelType)
            .description("Registered at: " + LocalDateTime.now())
            .modelPath(modelPath)
            .modelFormat(modelFormat)
            .accuracy(accuracy)
            .precision(precision)
            .recall(recall)
            .f1Score(f1Score)
            .status(ModelMetadata.ModelStatus.VALIDATED)
            .createdAt(LocalDateTime.now())
            .createdBy(createdBy)
            .build();

        return modelRegistry.save(metadata);
    }

    /**
     * Activate a model version
     */
    public void activateModel(Long modelId) {
        log.info("Activating model: {}", modelId);

        Optional<ModelMetadata> metadata = modelRegistry.findById(modelId);
        if (metadata.isEmpty()) {
            throw new IllegalArgumentException("Model not found: " + modelId);
        }

        // Deactivate previous active version
        ModelMetadata current = metadata.get();
        modelRegistry.findByModelName(current.getModelName()).stream()
            .filter(m -> m.getStatus() == ModelMetadata.ModelStatus.ACTIVE)
            .forEach(m -> {
                m.setStatus(ModelMetadata.ModelStatus.DEPRECATED);
                m.setDeprecatedAt(LocalDateTime.now());
                modelRegistry.save(m);
            });

        // Activate new version
        current.setStatus(ModelMetadata.ModelStatus.ACTIVE);
        current.setDeployedAt(LocalDateTime.now());
        modelRegistry.save(current);

        // Clear cache
        modelCache.remove(current.getModelName());
    }

    /**
     * Record prediction for model accuracy tracking
     */
    public void recordPrediction(Long modelId, boolean correct) {
        Optional<ModelMetadata> metadata = modelRegistry.findById(modelId);
        if (metadata.isPresent()) {
            ModelMetadata model = metadata.get();
            model.setTotalPredictions(model.getTotalPredictions() + 1);
            if (correct) {
                model.setCorrectPredictions(model.getCorrectPredictions() + 1);
            }
            model.setLastPredictionTime(LocalDateTime.now());
            modelRegistry.save(model);

            log.debug("Recorded prediction for model: {}. Accuracy: {}",
                modelId, model.getCurrentAccuracy());
        }
    }

    /**
     * Load model from file path
     */
    private Optional<Object> loadModelFromPath(ModelMetadata metadata) {
        try {
            Path modelPath = Paths.get(metadata.getModelPath());

            if (!Files.exists(modelPath)) {
                log.error("Model file not found: {}", metadata.getModelPath());
                return Optional.empty();
            }

            // In production, use ONNX Runtime or similar to load models
            log.info("Loading model from: {}", metadata.getModelPath());
            // Placeholder for actual model loading logic

            return Optional.of(new Object()); // Placeholder

        } catch (Exception e) {
            log.error("Error loading model: {}", metadata.getModelName(), e);
            return Optional.empty();
        }
    }

    /**
     * Get model metadata
     */
    public Optional<ModelMetadata> getModelMetadata(String modelName) {
        return modelRegistry
            .findByModelNameAndStatus(modelName, ModelMetadata.ModelStatus.ACTIVE);
    }

    /**
     * List all versions of a model
     */
    public Optional<java.util.List<ModelMetadata>> getModelVersions(String modelName) {
        var versions = modelRegistry.findByModelName(modelName);
        return versions.isEmpty() ? Optional.empty() : Optional.of(versions);
    }
}

