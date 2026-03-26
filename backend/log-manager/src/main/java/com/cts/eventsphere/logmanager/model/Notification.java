package com.cts.eventsphere.logmanager.model;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.DynamicInsert;

import java.time.LocalDateTime;

/**
 * Notification Entity
 *
 * @author 2479623
 * @version 1.0
 * @since 26-03-2026
 */
@Entity
@Table(name = "notification")
@Data
@DynamicInsert
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "notificationId", columnDefinition = "CHAR(36)")
    private String notificationId;

    @Column(name = "userId", nullable = false, columnDefinition = "CHAR(36)")
    private String userId;

    @Column(name = "eventId", columnDefinition = "CHAR(36)")
    private String eventId;

    @Column(name = "message", nullable = false, length = 255)
    private String message;

    @Column(name = "category", nullable = false, length = 20)
    private String category;

    @Column(name = "status", nullable = false, length = 20)
    private String status = "Unread";

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @CreationTimestamp
    private  LocalDateTime updatedAt;
}
