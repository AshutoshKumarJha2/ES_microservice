package com.cts.ticketmanager.models;


import com.cts.ticketmanager.models.data.RegistrationStatus;
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
 * Entity class for Registration table
 *
 * @author test-in-prod-10x
 * @version 1.0
 * @since 2026-03-02
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@DynamicInsert
@Table(uniqueConstraints = @UniqueConstraint(columnNames = {"eventId", "attendeeId"}))
public class Registration {

    @Id
    @UuidGenerator
    private String registrationId;

    @Column
    private String eventId;

    @Column(nullable = false)
    private String attendeeId;

    @ManyToOne
    @JoinColumn(name = "ticketId")
    Ticket ticket;

    @Column
    private LocalDate date;

    @Column
    @Enumerated(EnumType.STRING)
    RegistrationStatus status;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

}
