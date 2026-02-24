package com.example.notificationservice;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {

    private final NotificationRepository notificationRepository;

    public NotificationController(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @GetMapping("/{customerId}")
    public ResponseEntity<List<Notification>> getNotifications(@PathVariable Long customerId) {
        // Find all notifications and filter by customerId (normally you'd put a finder
        // in repository, doing this for speed since repo is minimal)
        List<Notification> customerNotifications = notificationRepository.findAll()
                .stream()
                .filter(n -> n.getCustomerId().equals(customerId))
                .sorted((n1, n2) -> n2.getTimestamp().compareTo(n1.getTimestamp())) // Newest first
                .collect(Collectors.toList());

        return ResponseEntity.ok(customerNotifications);
    }
}
