package com.cts.eventsphere.logmanager.controller;

import com.cts.eventsphere.logmanager.model.Notification;
import com.cts.eventsphere.logmanager.service.NotificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
@Slf4j
public class NotificationController {

    private final NotificationService notificationService;

    /**
     * Retrieves notifications for a user using infinite scroll pagination.
     * Example usage: {@code /api/v1/notifications/user-123/scroll?limit=10&lastTimestamp=2023-10-27T10:15:30}
     *
     * @param userId the unique identifier of the user
     * @param lastTimestamp the timestamp of the last notification retrieved (optional)
     * @param limit the maximum number of notifications to fetch (default is 20)
     * @return ResponseEntity containing a list of notifications and HTTP status 200 (OK)
     */
    @GetMapping("/{userId}/scroll")
    public ResponseEntity<List<Notification>> getNotificationsScroll(
            @PathVariable String userId,
            @Valid @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime lastTimestamp,
            @Valid @RequestParam(defaultValue = "20") int limit) {

        log.info("Fetching notifications for user: {} with limit: {} and lastTimestamp: {}", userId, limit, lastTimestamp);
        List<Notification> notifications = notificationService.getNotificationsScroll(userId, lastTimestamp, limit);
        log.info("Retrieved {} notifications for user: {}", notifications.size(), userId);
        return ResponseEntity.ok(notifications);
    }

    /**
     * Sends a new notification to a user (In-App + Email).
     *
     * @param userId the unique identifier of the user
     * @param message the notification message content
     * @param category the category of the notification (e.g., INFO, ALERT)
     * @return ResponseEntity with HTTP status 201 (CREATED) if notification is successfully sent
     */
    @PostMapping("/send")
    public ResponseEntity<Void> sendNotification(
            @Valid @RequestParam String userId,
            @Valid @RequestParam String message,
            @Valid @RequestParam String category) {

        log.info("Request to send notification to user: {} (Category: {})", userId, category);
        notificationService.sendNotification(userId,message, category);
        log.info("Notification sent successfully to user: {}", userId);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    /**
     * Marks a specific notification as read.
     *
     * @param notificationId the unique identifier of the notification
     * @return ResponseEntity with HTTP status 204 (NO_CONTENT) if update is successful
     */
    @PatchMapping("/{notificationId}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable String notificationId) {
        log.info("Request to mark notification {} as read", notificationId);
        notificationService.markAsRead(notificationId);
        log.info("Notification {} marked as read", notificationId);
        return ResponseEntity.noContent().build();
    }
}
