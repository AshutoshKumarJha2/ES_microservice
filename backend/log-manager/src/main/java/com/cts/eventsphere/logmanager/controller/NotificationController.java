package com.cts.eventsphere.logmanager.controller;

import com.cts.eventsphere.logmanager.model.Notification;
import com.cts.eventsphere.logmanager.service.NotificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Controller for Notifications.
 * Provides endpoints for retrieving, sending, and updating notification status.
 *
 * @author 2479623
 * @version 1.0
 * @since 10-03-2026
 */
@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
@Slf4j
public class NotificationController {

    private final NotificationService notificationService;

    /**
     * Retrieves notifications for a user using infinite scroll pagination.
     * Supports optional status filter (e.g. UNREAD) and cursor-based pagination via lastTimestamp.
     *
     * @param userId        the unique identifier of the user
     * @param lastTimestamp the createdAt of the oldest notification already loaded (optional)
     * @param limit         max notifications to return (default 20)
     * @param status        optional status filter: UNREAD or READ
     */
    @GetMapping("/{userId}/scroll")
    @PreAuthorize("hasRole('ADMIN') or principal.userId().equals(#userId)")
    public ResponseEntity<List<Notification>> getNotificationsScroll(
            @PathVariable String userId,
            @Valid @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime lastTimestamp,
            @Valid @RequestParam(defaultValue = "20") int limit,
            @RequestParam(required = false) String status) {

        log.info("Fetching notifications for user: {} limit={} lastTimestamp={} status={}", userId, limit, lastTimestamp, status);
        List<Notification> notifications = notificationService.getNotificationsScroll(userId, lastTimestamp, limit, status);
        log.info("Retrieved {} notifications for user: {}", notifications.size(), userId);
        return ResponseEntity.ok(notifications);
    }

    /**
     * Sends a new notification to a user (In-App + Email).
     */
    @PostMapping("/send")
    @PreAuthorize("hasRole('SYSTEM')")
    public ResponseEntity<Void> sendNotification(
            @Valid @RequestParam String userId,
            @Valid @RequestParam String message,
            @Valid @RequestParam String category) {

        log.info("Request to send notification to user: {} (Category: {})", userId, category);
        notificationService.sendNotification(userId, message, category);
        log.info("Notification sent successfully to user: {}", userId);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    /**
     * Marks a specific notification as read.
     */
    @PatchMapping("/{notificationId}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable String notificationId) {
        log.info("Request to mark notification {} as read", notificationId);
        notificationService.markAsRead(notificationId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Marks all unread notifications for a user as read.
     */
    @PatchMapping("/{userId}/read-all")
    @PreAuthorize("hasRole('ADMIN') or principal.userId().equals(#userId)")
    public ResponseEntity<Void> markAllAsRead(@PathVariable String userId) {
        log.info("Request to mark all notifications as read for user: {}", userId);
        notificationService.markAllAsRead(userId);
        return ResponseEntity.noContent().build();
    }
}
