package com.cts.eventsphere.expensemanager.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Immutable response DTO used to return the details of a
 * {@link com.cts.eventsphere.expensemanager.entity.Budget} to the client.
 *
 * <p>This DTO is constructed by the service layer after fetching or mutating
 * a budget, and is returned by the controller layer as the API response body.
 * It exposes all relevant financial fields including the computed
 * {@code actualAmount} and {@code variance} alongside audit timestamps.</p>
 *
 * <p>Field overview:</p>
 * <ul>
 *   <li>{@code budgetId}      — UUID of the budget record</li>
 *   <li>{@code eventId}       — UUID of the associated event (cross-service reference)</li>
 *   <li>{@code plannedAmount} — The financial ceiling set at budget creation</li>
 *   <li>{@code actualAmount}  — Total approved expenses accumulated so far</li>
 *   <li>{@code variance}      — Difference between planned and actual ({@code plannedAmount - actualAmount});
 *                               positive means under budget, negative means over budget</li>
 *   <li>{@code createdAt}     — Timestamp when the budget record was created</li>
 *   <li>{@code updatedAt}     — Timestamp of the last update to the budget record</li>
 * </ul>
 *
 * @author 2480081
 * @version 1.0
 * @since 25-03-2026
 * @see com.cts.eventsphere.expensemanager.entity.Budget
 */
@Builder
@Schema(description = "Response payload containing the financial details of an event's budget")
public record BudgetResponseDto(

        @Schema(description = "Unique identifier of the budget record", example = "b1c2d3e4-1234-5678-abcd-ef0123456789")
        String budgetId,

        @Schema(description = "Unique identifier of the event this budget belongs to", example = "evt-uuid-5678")
        String eventId,

        @Schema(description = "The planned financial ceiling set at budget creation", example = "50000.00")
        BigDecimal plannedAmount,

        @Schema(description = "Total approved expenses accumulated so far; starts at 0", example = "12500.00")
        BigDecimal actualAmount,

        @Schema(description = "Difference between planned and actual spend (plannedAmount - actualAmount); positive means under budget, negative means over budget", example = "37500.00")
        BigDecimal variance,

        @Schema(description = "Timestamp when the budget record was created", example = "2026-03-25T09:00:00")
        LocalDateTime createdAt,

        @Schema(description = "Timestamp of the last update to the budget record", example = "2026-03-25T14:30:00")
        LocalDateTime updatedAt

) {}