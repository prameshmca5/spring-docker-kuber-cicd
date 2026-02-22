package com.example.notificationservice;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    private static final Logger log = LoggerFactory.getLogger(NotificationController.class);

    private final NotificationRepository repository;

    public NotificationController(NotificationRepository repository) {
        this.repository = repository;
        log.info("NotificationController initialized");
    }

    @GetMapping
    public ResponseEntity<List<Notification>> getAll() {
        log.info("GET /api/v1/notifications - Fetching all notifications");
        List<Notification> notifications = repository.findAll();
        log.debug("Found {} notifications", notifications.size());
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Notification> getById(@PathVariable Long id) {
        log.info("GET /api/v1/notifications/{} - Fetching notification by ID", id);
        return repository.findById(id)
                .map(n -> {
                    log.debug("Notification found with ID: {}", id);
                    return ResponseEntity.ok(n);
                })
                .orElseGet(() -> {
                    log.warn("Notification not found with ID: {}", id);
                    return ResponseEntity.notFound().build();
                });
    }

    @PostMapping
    public ResponseEntity<Notification> create(@RequestBody Notification n) {
        log.info("POST /api/v1/notifications - Creating new notification");
        Notification saved = repository.save(n);
        log.info("Notification created with ID: {}", saved.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        log.info("DELETE /api/v1/notifications/{} - Deleting notification", id);
        if (!repository.existsById(id)) {
            log.warn("Notification not found for deletion with ID: {}", id);
            return ResponseEntity.notFound().build();
        }
        repository.deleteById(id);
        log.info("Notification deleted with ID: {}", id);
        return ResponseEntity.noContent().build();
    }
}
