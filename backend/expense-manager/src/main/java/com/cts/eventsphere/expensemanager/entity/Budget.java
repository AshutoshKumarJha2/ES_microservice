package com.cts.eventsphere.expensemanager.entity;


import jakarta.persistence.Column;
import jakarta.persistence.Entity;
//import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
//import org.hibernate.annotations.DynamicInsert;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;


/**
 * Entity representing the financial budget allocation for an Event in the EventSphere platform.
 *
 * <p>A budget defines the planned financial ceiling for an event and tracks how much
 * has actually been spent as expenses are submitted and approved. Each event is
 * associated with at most one budget.</p>
 *
 * <p>The three core financial fields work together as follows:</p>
 * <pre>
 *   variance = plannedAmount - actualAmount
 *
 *   plannedAmount  →  set at budget creation (the ceiling)
 *   actualAmount   →  grows as expenses are approved (starts at 0)
 *   variance       →  positive means under budget, negative means over budget (starts at 0)
 * </pre>
 *
 * <p>Key characteristics:</p>
 * <ul>
 *   <li>Primary key is a UUID auto-generated and stored as {@code CHAR(36)}</li>
 *   <li>Linked to an event via {@code eventId} (no foreign key constraint — cross-service reference)</li>
 *   <li>{@code actualAmount} and {@code variance} default to {@link java.math.BigDecimal#ZERO} at creation</li>
 *   <li>{@code createdAt} and {@code updatedAt} are managed automatically by Hibernate</li>
 *   <li>All monetary values use {@code precision = 10, scale = 2} to safely handle currency arithmetic</li>
 * </ul>
 *
 * @author 2480081
 * @version 1.0
 * @since 25-03-2026
 * @see com.cts.eventsphere.expensemanager.repository.BudgetRepository
 */
@Entity
@Table(name = "budget")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Budget {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "CHAR(36)")
    private String budgetId;

    @Column(nullable = false)
    private String eventId;

    @Column(nullable = false , precision = 10 , scale = 2)
    private BigDecimal plannedAmount;

    @Column(nullable = false , precision = 10 , scale = 2)
    private BigDecimal actualAmount = BigDecimal.ZERO; // There is no actualAmount in the starting so it should start from 0

    @Column(nullable = false , precision = 10 , scale = 2)
    private BigDecimal variance = BigDecimal.ZERO; // (variance = plannedAmount - actualAmount) ---> so initially it will be 0

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;




}