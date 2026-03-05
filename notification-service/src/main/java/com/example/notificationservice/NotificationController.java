package com.example.notificationservice;

import jakarta.transaction.Transactional;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    private final NotificationRepository notificationRepository;

    public NotificationController(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    /** GET all notifications for a customer (newest first) */
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<Notification>> getAll(@PathVariable Long customerId) {
        return ResponseEntity.ok(notificationRepository.findByCustomerIdOrderByTimestampDesc(customerId));
    }

    /** GET only unread notifications for a customer */
    @GetMapping("/customer/{customerId}/unread")
    public ResponseEntity<List<Notification>> getUnread(@PathVariable Long customerId) {
        return ResponseEntity.ok(notificationRepository.findByCustomerIdAndReadFalseOrderByTimestampDesc(customerId));
    }

    /** GET unread count badge for a customer */
    @GetMapping("/customer/{customerId}/unread/count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(@PathVariable Long customerId) {
        long count = notificationRepository.countByCustomerIdAndReadFalse(customerId);
        return ResponseEntity.ok(Map.of("unreadCount", count));
    }

    /** PUT mark a single notification as read */
    @PutMapping("/{id}/read")
    public ResponseEntity<Notification> markRead(@PathVariable Long id) {
        return notificationRepository.findById(id)
                .map(n -> {
                    n.setRead(true);
                    return ResponseEntity.ok(notificationRepository.save(n));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /** PUT mark ALL notifications as read for a customer */
    @Transactional
    @PutMapping("/customer/{customerId}/read-all")
    public ResponseEntity<Map<String, Integer>> markAllRead(@PathVariable Long customerId) {
        int updated = notificationRepository.markAllReadByCustomerId(customerId);
        return ResponseEntity.ok(Map.of("markedAsRead", updated));
    }
}
