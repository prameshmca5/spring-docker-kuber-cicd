package com.qacts.aicore.registry;

import com.qacts.aicore.model.ModelMetadata;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ModelRegistry extends JpaRepository<ModelMetadata, Long> {

    Optional<ModelMetadata> findByModelNameAndStatus(String modelName, ModelMetadata.ModelStatus status);

    List<ModelMetadata> findByModelType(ModelMetadata.ModelType modelType);

    List<ModelMetadata> findByStatusOrderByCreatedAtDesc(ModelMetadata.ModelStatus status);

    Optional<ModelMetadata> findByModelNameAndModelVersion(String modelName, String version);

    List<ModelMetadata> findByModelName(String modelName);
}

