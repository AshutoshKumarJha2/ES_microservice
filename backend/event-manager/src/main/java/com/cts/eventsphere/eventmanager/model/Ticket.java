package com.cts.eventsphere.eventmanager.model;

import com.cts.eventsphere.eventmanager.model.data.TicketStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.DynamicInsert;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.UuidGenerator;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Entity representing a ticket type for an {@link Event}.
 *
 * <p>Each ticket belongs to exactly one event and has a type (e.g., "vip", "general"),
 * a price, and an availability status. Ticket types are unique per event.</p>
 *
 * @author test-in-prod-10x
 * @version 1.0
 * @since 2026-03-26
 */
@Data
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Builder
@DynamicInsert
@Table(name = "ticket")
public class Ticket {

    @Id
    @UuidGenerator
    @Column(columnDefinition = "CHAR(36)")
    private String ticketId;

    @ManyToOne
    @JoinColumn(name = "eventId", nullable = false)
    private Event event;

    @Column
    private String type;

    @Column
    private BigDecimal price;

    @Enumerated(EnumType.STRING)
    private TicketStatus status;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
