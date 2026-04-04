package com.cts.eventsphere.expensemanager.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import com.cts.eventsphere.expensemanager.entity.data.ExpenseStatus;

/**
 * Immutable response DTO used to return the details of an
 * {@link com.cts.eventsphere.expensemanager.entity.Expense} to the client.
 *
 * <p>This DTO is constructed by the service layer after fetching or mutating
 * an expense, and is returned by the controller layer as the API response body.
 * It exposes all relevant fields of the expense including its current
 * approval status and audit timestamps.</p>
 *
 * <p>Field overview:</p>
 * <ul>
 *   <li>{@code expenseId}  — UUID of the expense</li>
 *   <li>{@code eventId}    — UUID of the associated event (cross-service reference)</li>
 *   <li>{@code description}— Human-readable description of the expense</li>
 *   <li>{@code amount}     — Monetary value of the expense</li>
 *   <li>{@code date}       — Date the expense was incurred</li>
 *   <li>{@code approvedBy} — UUID of the approver; {@code null} until approved</li>
 *   <li>{@code status}     — Current lifecycle status of the expense</li>
 *   <li>{@code createdAt}  — Timestamp when the expense record was created</li>
 *   <li>{@code updatedAt}  — Timestamp of the last update to the expense record</li>
 * </ul>
 *
 * @author 2480081
 * @version 1.0
 * @since 25-03-2026
 * @see com.cts.eventsphere.expensemanager.entity.Expense
 * @see ExpenseStatus
 */
@Builder
@Schema(description = "Response payload containing the details of an expense")
public record ExpenseResponseDto(

        @Schema(description = "Unique identifier of the expense", example = "a3f1c2d4-1234-5678-abcd-ef0123456789")
        String expenseId,

        @Schema(description = "Unique identifier of the event this expense belongs to", example = "evt-uuid-5678")
        String eventId,

        @Schema(description = "Brief description of the expense", example = "Catering charges for event hall")
        String description,

        @Schema(description = "Monetary amount of the expense", example = "1500.00")
        BigDecimal amount,

        @Schema(description = "Date on which the expense was incurred", example = "2026-03-25")
        LocalDate date,

        @Schema(description = "UUID of the user who approved the expense; null if not yet approved", example = "usr-uuid-9999")
        String approvedBy,

        @Schema(description = "Current lifecycle status of the expense", example = "SUBMITTED")
        ExpenseStatus status,

        @Schema(description = "Timestamp when the expense record was created", example = "2026-03-25T10:15:30")
        LocalDateTime createdAt,

        @Schema(description = "Timestamp of the last update to the expense record", example = "2026-03-25T12:45:00")
        LocalDateTime updatedAt

) {}