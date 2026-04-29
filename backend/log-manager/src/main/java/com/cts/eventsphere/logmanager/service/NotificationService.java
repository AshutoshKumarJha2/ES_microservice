package com.cts.eventsphere.logmanager.service;

import com.cts.eventsphere.logmanager.model.Notification;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Notification Service to handle notification events.
 * * @author 2479623
 *
 * @version 1.0
 * @since 26-03-2026
 */
public interface NotificationService {
    List<Notification> getNotificationsScroll(String userId, LocalDateTime lastTimestamp, int limit, String status);

    void sendNotification(String userId, String message, String category);

    void markAsRead(String notificationId);

    void markAllAsRead(String userId);
}