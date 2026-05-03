package com.cts.eventsphere.logmanager.repository;
import com.cts.eventsphere.logmanager.model.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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

    @Query("SELECT n FROM Notification n WHERE n.userId = :userId AND n.createdAt < :anchor ORDER BY n.createdAt DESC")
    Page<Notification> findScrollPage(
            @Param("userId") String userId,
            @Param("anchor") LocalDateTime anchor,
            Pageable pageable);

    @Query("SELECT n FROM Notification n WHERE n.userId = :userId AND n.status = :status AND n.createdAt < :anchor ORDER BY n.createdAt DESC")
    Page<Notification> findScrollPageByStatus(
            @Param("userId") String userId,
            @Param("status") String status,
            @Param("anchor") LocalDateTime anchor,
            Pageable pageable);

    @Modifying
    @Query("UPDATE Notification n SET n.status = 'READ' WHERE n.userId = :userId AND n.status = 'UNREAD'")
    void markAllReadByUserId(@Param("userId") String userId);
}
