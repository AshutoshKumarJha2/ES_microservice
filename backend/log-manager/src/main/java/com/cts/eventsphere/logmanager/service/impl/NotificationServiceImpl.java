package com.cts.eventsphere.logmanager.service.impl;
import com.cts.eventsphere.logmanager.model.Notification;
import com.cts.eventsphere.logmanager.model.data.NotificationStatus;
import com.cts.eventsphere.logmanager.repository.NotificationRepository;
import com.cts.eventsphere.logmanager.service.EmailService;
import com.cts.eventsphere.logmanager.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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

    /**
     * @param userId
     * @param lastTimestamp
     * @param limit
     * @return
     */
    @Override
    public List<Notification> getNotificationsScroll(String userId, LocalDateTime lastTimestamp, int limit) {
        LocalDateTime anchor = (lastTimestamp == null) ? LocalDateTime.now() : lastTimestamp;
        log.debug("Fetching scroll notifications for user: {} using anchor timestamp: {}", userId, anchor);

        List<Notification> results = notificationRepository.findTop20ByUserIdAndCreatedAtLessThanOrderByCreatedAtDesc(
                userId,
                anchor
        );

        log.info("Found {} notifications for user: {} starting from {}", results.size(), userId, anchor);
        return results;
    }

    /**
     * @param userId
     * @param message
     * @param category
     */
    @Override
    @Transactional
    public void sendNotification(String userId, String message, String category) {
        log.info("Processing notification for user: {} and category: {}", userId, category);

        Notification notification = Notification.builder()
                .userId(userId)
                .message(message)
                .category(category)
                .status("Unread")
                .build();

        Notification savedNotification = notificationRepository.save(notification);
        log.debug("Notification saved to DB with ID: {}", savedNotification.getNotificationId());

//        log.info("Dispatching email notification to: {}", email);
//        emailService.sendNotificationEmail(email, "New Notification: " + category, message);
    }

    /**
     * @param notificationId
     */
    @Transactional
    @Override
    public void markAsRead(String notificationId) {
        log.info("Attempting to mark notification {} as read", notificationId);
        notificationRepository.findById(notificationId).ifPresentOrElse(
                n -> {
                    n.setStatus(String.valueOf(NotificationStatus.READ));
                    log.info("Notification {} status updated to Read", notificationId);
                },
                () -> log.warn("Notification {} not found, unable to mark as read", notificationId)
        );
    }
}