package com.cts.eventsphere.logmanager.service.impl;
import com.cts.eventsphere.logmanager.model.Notification;
import com.cts.eventsphere.logmanager.model.data.NotificationStatus;
import com.cts.eventsphere.logmanager.repository.NotificationRepository;
import com.cts.eventsphere.logmanager.service.EmailService;
import com.cts.eventsphere.logmanager.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Implementation for Notification Service
 * * @author 2479623
 *
 * @version 1.0
 * @since 26-03-2026
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationServiceImpl implements NotificationService {
    private final NotificationRepository notificationRepository;
    private final EmailService emailService;

    @Override
    public List<Notification> getNotificationsScroll(String userId, LocalDateTime lastTimestamp, int limit, String status) {
        LocalDateTime anchor = (lastTimestamp == null) ? LocalDateTime.now() : lastTimestamp;
        log.debug("Fetching scroll notifications for user: {} using anchor timestamp: {}, status filter: {}", userId, anchor, status);

        Pageable pageable = PageRequest.of(0, limit);
        List<Notification> results;

        if (status != null && !status.isBlank()) {
            results = notificationRepository.findScrollPageByStatus(userId, status.toUpperCase(), anchor, pageable).getContent();
        } else {
            results = notificationRepository.findScrollPage(userId, anchor, pageable).getContent();
        }

        log.info("Found {} notifications for user: {} starting from {}", results.size(), userId, anchor);
        return results;
    }

    @Override
    @Transactional
    public void sendNotification(String userId, String message, String category) {
        log.info("Processing notification for user: {} and category: {}", userId, category);

        Notification notification = Notification.builder()
                .userId(userId)
                .message(message)
                .category(category)
                .status(NotificationStatus.UNREAD.name())
                .build();

        Notification savedNotification = notificationRepository.save(notification);
        log.debug("Notification saved to DB with ID: {}", savedNotification.getNotificationId());
    }

    @Transactional
    @Override
    public void markAsRead(String notificationId) {
        log.info("Attempting to mark notification {} as read", notificationId);
        notificationRepository.findById(notificationId).ifPresentOrElse(
                n -> {
                    n.setStatus(NotificationStatus.READ.name());
                    log.info("Notification {} status updated to READ", notificationId);
                },
                () -> log.warn("Notification {} not found, unable to mark as read", notificationId)
        );
    }

    @Transactional
    @Override
    public void markAllAsRead(String userId) {
        log.info("Marking all notifications as read for user: {}", userId);
        notificationRepository.markAllReadByUserId(userId);
        log.info("All unread notifications marked as read for user: {}", userId);
    }
}
