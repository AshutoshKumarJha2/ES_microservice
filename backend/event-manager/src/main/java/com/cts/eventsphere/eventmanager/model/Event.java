package com.cts.eventsphere.eventmanager.model;

import com.cts.eventsphere.eventmanager.model.data.EventStatus;
import jakarta.persistence.*;
import lombok.Builder;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.DynamicInsert;
import org.hibernate.annotations.DynamicUpdate;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Event model class.
 * * @author 2479623
 *
 * @version 1.0
 * @since 25-03-2026
 */
@Entity
@Table(name = "event")
@Data
@DynamicInsert
@DynamicUpdate
@Builder
public class Event {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "CHAR(36)")
    private String eventId;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false, columnDefinition = "CHAR(36)")
    private String organizerId;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    @Column(columnDefinition = "CHAR(36)")
    private String venueId;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "ENUM('draft', 'published', 'completed', 'cancelled')")
    private EventStatus status = EventStatus.draft;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}