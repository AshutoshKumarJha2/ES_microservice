package com.eventsphere.engagement_manager.model;

import com.eventsphere.engagement_manager.model.data.EngagementType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.DynamicInsert;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * Engagement Model class
 *
 * @author 2480027
 * @version 1.0
 * @since 25-03-2026
 */
@Entity
@Table(name = "engagement")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@DynamicInsert
public class Engagement {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "CHAR(36)")
    private String engagementId;

    @Column(name = "eventId", nullable = false, columnDefinition = "CHAR(36)")
    private String eventId;

    @Column(name = "attendeeId", nullable = false, columnDefinition = "CHAR(36)")
    private String attendeeId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private EngagementType activity;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}