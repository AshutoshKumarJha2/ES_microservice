package com.cts.eventsphere.expensemanager.dto.mapper;

import org.springframework.stereotype.Component;

import com.cts.eventsphere.expensemanager.dto.request.ExpenseRequestDto;
import com.cts.eventsphere.expensemanager.entity.Expense;
import com.cts.eventsphere.expensemanager.entity.data.ExpenseStatus;

/**
 * Utility class responsible for mapping an {@link ExpenseRequestDto}
 * to an {@link Expense} entity.
 *
 * <p>The following fields are set by default at creation:</p>
 * <ul>
 *   <li>{@code status} — defaults to {@link ExpenseStatus#SUBMITTED}</li>
 *   <li>{@code approvedBy} — left as {@code null} until approval</li>
 *   <li>{@code expenseId}, {@code createdAt}, {@code updatedAt} — managed by JPA/Hibernate</li>
 * </ul>
 *
 * @author 2480081
 * @version 1.0
 * @since 25-03-2026
 * @see Expense
 * @see ExpenseRequestDto
 */
@Component
public class ExpenseRequestDtoMapper {

    private ExpenseRequestDtoMapper() {
        // Utility class — prevent instantiation
    }

    /**
     * Converts an {@link ExpenseRequestDto} and a given {@code eventId} into
     * a new {@link Expense} entity ready to be persisted.
     *
     * @param dto     the incoming request DTO containing expense details; must not be {@code null}
     * @param eventId the UUID of the event this expense belongs to; must not be {@code null}
     * @return a new {@link Expense} entity populated with the DTO fields
     */
    public static Expense toEntity(ExpenseRequestDto dto, String eventId) {
        return Expense.builder()
                .eventId(eventId)
                .description(dto.description())
                .amount(dto.amount())
                .date(dto.date())
                .status(ExpenseStatus.SUBMITTED)
                .approvedBy(null)
                .build();
    }
    
}