package com.cts.eventsphere.expensemanager.entity;

import com.cts.eventsphere.expensemanager.entity.data.PaymentMethod;
import com.cts.eventsphere.expensemanager.entity.data.PaymentStatus;
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
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Entity representing a financial payment in the EventSphere platform.
 *
 * <p>A payment is linked to <strong>exactly one</strong> of the following:</p>
 * <ul>
 *   <li>An {@link Expense} — when the Finance Manager pays an approved expense
 *       (venue booking, resource allocation, vendor delivery, or manual expense)</li>
 *   <li>An Invoice (via {@code invoiceId}) — when the Finance Manager pays a vendor invoice.
 *       Currently stored as a plain String because the Invoice entity is not yet built.
 *       Will be converted to a {@code @ManyToOne} JPA relation later.</li>
 * </ul>
 *
 * <p>Service-layer validation enforces that exactly one of {@code expense} or
 * {@code invoiceId} is set — never both, never neither.</p>
 *
 * @author 2480081
 * @version 1.0
 * @since 26-03-2026
 */
@Entity
@Table(name = "payment")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "CHAR(36)")
    private String paymentId;

    /**
     * The expense this payment settles. Nullable — set only for expense payments.
     * Expense is in the same Finance Service, so a JPA relation is used.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "expenseId", nullable = true)
    private Expense expense;

    /**
     * The invoice this payment settles. Nullable — set only for invoice payments.
     * Stored as a plain String for now because the Invoice entity is not yet built.
     * TODO: Convert to @ManyToOne JPA relation when Invoice entity is created.
     */
    @Column(name = "invoiceId", nullable = true, length = 36)
    private String invoiceId;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentMethod method;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus status;

    @Column(nullable = false)
    private LocalDateTime paymentDate;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}