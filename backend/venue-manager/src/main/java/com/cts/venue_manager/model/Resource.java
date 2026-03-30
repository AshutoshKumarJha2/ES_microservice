package com.cts.venue_manager.model;

import com.cts.venue_manager.model.data.Availability;
import com.cts.venue_manager.model.data.ResourceType;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Represents a specific resource associated with a venue, such as equipment or staff.
 * This entity tracks resource type, current availability status, and costing rates
 * to facilitate efficient venue management and event planning.
 *
 * @author 2479476
 * @version 1.0
 * @since 2026-03-26
 */
@Data
@Table(name = "resource")
@Entity
public class Resource {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String resourceId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "venueId", nullable = false)
    private Venue venue;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "ENUM('EQUIPMENT','STAFF')")
    private ResourceType type = ResourceType.EQUIPMENT;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "ENUM('AVAILABLE','IN_USE','UNAVAILABLE')")
    private Availability availability = Availability.AVAILABLE;

    @Column(precision = 10, scale = 2)
    private BigDecimal costRate;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "unit")
    private Integer unit;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}