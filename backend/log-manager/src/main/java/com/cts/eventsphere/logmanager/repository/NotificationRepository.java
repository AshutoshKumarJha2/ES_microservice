package com.cts.eventsphere.logmanager.repository;
import com.cts.eventsphere.logmanager.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
/**
 * Repository class for Notification
 *
 * @author 2479623
 * @version 1.0
 * @since 26-03-2026
 */
public interface NotificationRepository extends JpaRepository<Notification, String> {
    List<Notification> findTop20ByUserIdAndCreatedAtLessThanOrderByCreatedAtDesc(String userId, LocalDateTime createdDate);
}
