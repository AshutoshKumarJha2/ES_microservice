package com.cts.eventsphere.expensemanager.dto.request;

import com.cts.eventsphere.expensemanager.entity.data.PaymentMethod;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Request DTO for processing a payment against an approved expense.
 *
 * <p>The {@code expenseId} is supplied as a path variable in the controller,
 * not in this DTO.</p>
 *
 * @author 2480081
 * @version 1.0
 * @since 26-03-2026
 */
@Builder
@Schema(description = "Request payload for making a payment on an approved expense")
public record PaymentRequestDto(

        @Schema(description = "Payment amount", example = "20000.00")
        @NotNull(message = "Amount is required")
        @DecimalMin(value = "0.0", inclusive = false, message = "Amount must be greater than 0")
        BigDecimal amount,

        @Schema(description = "Payment method", example = "BANK_TRANSFER")
        @NotNull(message = "Payment method is required")
        PaymentMethod method,

        @Schema(description = "Date and time of payment", example = "2026-03-26T14:30:00")
        @NotNull(message = "Payment date is required")
        LocalDateTime paymentDate
) {}