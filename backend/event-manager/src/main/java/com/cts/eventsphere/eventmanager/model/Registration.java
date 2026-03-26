package com.cts.eventsphere.eventmanager.model;

import com.cts.eventsphere.eventmanager.model.data.RegistrationStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.DynamicInsert;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.UuidGenerator;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Entity representing an attendee's registration for an {@link Event}.
 *
 * <p>Links an attendee to an event through a selected {@link Ticket}.
 * An attendee can only register once per event (enforced by unique constraint on eventId + attendeeId).</p>
 *
 * @author test-in-prod-10x
 * @version 1.0
 * @since 2026-03-26
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@DynamicInsert
@Table(name = "registration", uniqueConstraints = @UniqueConstraint(columnNames = {"eventId", "attendeeId"}))
public class Registration {

    @Id
    @UuidGenerator
    @Column(columnDefinition = "CHAR(36)")
    private String registrationId;

    @ManyToOne
    @JoinColumn(name = "eventId", nullable = false)
    private Event event;

    @Column(nullable = false)
    private String attendeeId;

    @ManyToOne
    @JoinColumn(name = "ticketId")
    private Ticket ticket;

    @Column
    private LocalDate date;

    @Column
    @Enumerated(EnumType.STRING)
    private RegistrationStatus status;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
