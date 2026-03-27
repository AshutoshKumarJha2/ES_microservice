package com.cts.eventsphere.expensemanager.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;

import java.math.BigDecimal;

/**
 * Immutable request DTO used to capture the details required to create or update
 * a {@link com.cts.eventsphere.expensemanager.entity.Budget} for an event
 * in the EventSphere platform.
 *
 * <p>This DTO is received by the controller layer, validated via Bean Validation
 * annotations, and passed to the service layer for processing. The {@code eventId}
 * is expected to be supplied separately as a path variable in the controller.</p>
 *
 * <p>Validation rules:</p>
 * <ul>
 *   <li>{@code plannedAmount} — required, must be greater than 0</li>
 * </ul>
 *
 * <p>Note: {@code actualAmount} and {@code variance} are not accepted from the client —
 * they are computed and managed internally by the service layer as expenses
 * are submitted and approved.</p>
 *
 * @author 2480081
 * @version 1.0
 * @since 25-03-2026
 * @see com.cts.eventsphere.expensemanager.entity.Budget
 */
@Builder
@Schema(description = "Request payload for creating or updating a budget for an event")
public record BudgetRequestDto(

        @Schema(
            description = "The planned financial ceiling for the event; must be greater than 0",
            example = "50000.00"
        )
        @NotNull(message = "Planned Amount is required")
        @DecimalMin(value = "0.0", inclusive = false, message = "Planned Amount must be greater than 0")
        BigDecimal plannedAmount

) {}