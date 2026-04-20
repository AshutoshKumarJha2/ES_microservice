package com.cts.venue_manager.model;

import com.cts.venue_manager.model.data.AllocationStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * Manages the assignment and quantity of specific resources to events within a venue.
 * This entity serves as a link between resources and events, ensuring tracking
 * of resource utilization and historical allocation data.
 *
 * @author 2479476
 * @version 1.0
 * @since 2026-03-26
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
@Table(name = "resource_allocation")
public class ResourceAllocation {

    @Id
    @Column(name = "allocationId", length = 36, nullable = false)
    @GeneratedValue(strategy = GenerationType.UUID)
    private String allocationId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resourceId", nullable = false)
    private Resource resource;

    @Column(name = "eventId", nullable = false, length = 36)
    private String eventId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "venueId", nullable = false)
    private Venue venue;

    @Column(nullable = false)
    private Integer quantity;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "ENUM('PENDING','APPROVED','REJECTED')", nullable = false)
    private AllocationStatus status = AllocationStatus.PENDING;

    @CreationTimestamp
    @Column(name = "createdAt", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updatedAt")
    private LocalDateTime updatedAt;
}