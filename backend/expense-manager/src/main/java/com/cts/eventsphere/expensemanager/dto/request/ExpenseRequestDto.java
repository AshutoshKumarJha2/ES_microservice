package com.cts.eventsphere.expensemanager.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Immutable request DTO used to capture the details required to create
 * a new {@link com.cts.eventsphere.expensemanager.entity.Expense} in the system.
 *
 * <p>This DTO is received by the controller layer, validated via Bean Validation
 * annotations, and passed to the service layer for processing. The {@code eventId}
 * is expected to be supplied separately as a path variable in the controller.</p>
 *
 * <p>Validation rules:</p>
 * <ul>
 *   <li>{@code description} — required, max 255 characters</li>
 *   <li>{@code amount} — required, must be greater than 0</li>
 *   <li>{@code date} — required, represents the date the expense was incurred</li>
 * </ul>
 *
 * @author 2480081
 * @version 1.0
 * @since 25-03-2026
 * @see com.cts.eventsphere.expensemanager.entity.Expense
 */
@Builder
@Schema(description = "Request payload for creating a new expense")
public record ExpenseRequestDto(

        @Schema(
            description = "Brief description of the expense",
            example = "Catering charges for event hall"
        )
        @NotBlank(message = "Description cannot be empty")
        @Size(max = 255, message = "Description provided is too long")
        String description,

        @Schema(
            description = "Amount of the expense, must be greater than 0",
            example = "1500.00"
        )
        @NotNull(message = "Amount is required")
        @DecimalMin(value = "0.0", inclusive = false, message = "Amount must be greater than 0")
        BigDecimal amount,

        @Schema(
            description = "Date on which the expense was incurred (yyyy-MM-dd)",
            example = "2026-03-25"
        )
        @NotNull(message = "Date is required")
        LocalDate date

) {}