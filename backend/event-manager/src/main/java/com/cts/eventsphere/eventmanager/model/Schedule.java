package com.cts.eventsphere.eventmanager.model;

import com.cts.eventsphere.eventmanager.model.data.ScheduleStatus;
import jakarta.persistence.*;
import lombok.Builder;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Schedule model class.
 * * @author 2479623
 *
 * @version 1.0
 * @since 25-03-2026
 */
@Entity
@Table(name = "schedule")
@Data
@Builder
public class Schedule {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "CHAR(36)")
    private String scheduleId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "eventId", nullable = false)
    private Event event;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false, columnDefinition = "CHAR(36)")
    private String timeSlot;

    @Column(nullable = false, columnDefinition = "CHAR(100)")
    private String activity;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "ENUM('draft','active','completed','terminated')")
    private ScheduleStatus status = ScheduleStatus.draft;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}