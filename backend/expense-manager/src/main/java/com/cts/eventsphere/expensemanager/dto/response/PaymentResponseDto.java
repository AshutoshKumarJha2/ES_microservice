package com.cts.eventsphere.expensemanager.dto.response;

import com.cts.eventsphere.expensemanager.entity.data.PaymentMethod;
import com.cts.eventsphere.expensemanager.entity.data.PaymentStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Response DTO returning the details of a processed payment.
 *
 * @author 2480081
 * @version 1.0
 * @since 26-03-2026
 */
@Builder
@Schema(description = "Response payload containing payment transaction details")
public record PaymentResponseDto(

        @Schema(description = "Unique payment ID", example = "pay-uuid-1234")
        String paymentId,

        @Schema(description = "Expense ID this payment settles; null for invoice payments", example = "exp-uuid-5678")
        String expenseId,

        @Schema(description = "Invoice ID this payment settles; null for expense payments")
        String invoiceId,

        @Schema(description = "Payment amount", example = "20000.00")
        BigDecimal amount,

        @Schema(description = "Payment method used", example = "BANK_TRANSFER")
        PaymentMethod method,

        @Schema(description = "Payment status", example = "COMPLETED")
        PaymentStatus status,

        @Schema(description = "Date and time of payment", example = "2026-03-26T14:30:00")
        LocalDateTime paymentDate,

        @Schema(description = "Record creation timestamp")
        LocalDateTime createdAt,

        @Schema(description = "Record last updated timestamp")
        LocalDateTime updatedAt
) {}