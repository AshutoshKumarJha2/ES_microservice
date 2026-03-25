package com.cts.venue_manager.model;

import com.cts.venue_manager.model.data.Availability;
import com.cts.venue_manager.model.data.ResourceType;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

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
    @Column(columnDefinition = "ENUM('equipment','staff')")
    private ResourceType type = ResourceType.equipment;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "ENUM('available','in_use','unavailable')")
    private Availability availability = Availability.available;

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

