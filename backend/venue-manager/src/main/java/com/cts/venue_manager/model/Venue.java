package com.cts.venue_manager.model;

import com.cts.venue_manager.model.data.AvailabilityStatus;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Represents a physical venue within the management system.
 * This entity maintains core site details including location, capacity, and status,
 * while serving as the primary aggregate root for associated resources and bookings.
 *
 * @author 2479476
 * @version 1.0
 * @since 2026-03-26
 */
@Entity
@Table(name = "venue")
@Data
public class Venue {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "venueId")
    private String venueId;

    @OneToMany(mappedBy = "venue", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Resource> resources;

    @OneToMany(mappedBy = "venue", cascade = CascadeType.ALL)
    private List<Booking> bookings;

    @Column(columnDefinition = "VARCHAR(36)")
    private String managerId;

    @Column(nullable = false, columnDefinition = "VARCHAR(255)")
    private String location;

    @Column(nullable = false)
    private int capacity;

    @Column(nullable = false, columnDefinition = "VARCHAR(100)")
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "ENUM('AVAILABLE','UNAVAILABLE','MAINTENENCE')")
    private AvailabilityStatus availabilityStatus = AvailabilityStatus.AVAILABLE;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}