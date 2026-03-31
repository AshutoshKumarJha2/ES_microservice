package com.cts.eventsphere.expensemanager.entity;


import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
//import org.hibernate.annotations.DynamicInsert;
import org.hibernate.annotations.UpdateTimestamp;

import com.cts.eventsphere.expensemanager.entity.data.ExpenseStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Date;


/**
 * Entity representing a financial expense linked to an Event in the EventSphere platform.
 *
 * <p>Each expense captures the monetary details of a transaction incurred during
 * an event, including its amount, description, and the date it was incurred.
 * Expenses follow an approval lifecycle tracked by {@link ExpenseStatus}:</p>
 * <pre>
 *   SUBMITTED → APPROVED → PAID
 *             ↘ REJECTED
 * </pre>
 *
 * <p>Key characteristics:</p>
 * <ul>
 *   <li>Primary key is a UUID auto-generated and stored as {@code CHAR(36)}</li>
 *   <li>Linked to an event via {@code eventId} (no foreign key constraint — cross-service reference)</li>
 *   <li>Status is persisted as a MySQL {@code ENUM} column</li>
 *   <li>{@code createdAt} and {@code updatedAt} are managed automatically by Hibernate</li>
 *   <li>{@code approvedBy} holds the UUID of the approver and is nullable until approval</li>
 * </ul>
 *
 * @author 2480081
 * @version 1.0
 * @since 25-03-2026
 * @see ExpenseStatus
 */
@Entity
@Table(name = "expense")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Expense {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "CHAR(36)")
    private String expenseId;

    @Column(nullable = false)
    private String eventId;

    @Column(nullable = false , length = 255)
    private String description;

    @Column(nullable = false , precision = 10 , scale = 2)
    private BigDecimal amount;

    @Column(nullable = false)
    private LocalDate date;

    @Column(name = "approvedBy", nullable = true, length = 36)
    private String approvedBy;

    @Enumerated(EnumType.STRING)
    @Column()
    private ExpenseStatus status = ExpenseStatus.SUBMITTED;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
