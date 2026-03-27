package com.cts.eventsphere.expensemanager.dto.mapper;

import org.springframework.stereotype.Component;

import com.cts.eventsphere.expensemanager.dto.response.ExpenseResponseDto;
import com.cts.eventsphere.expensemanager.entity.Expense;

/**
 * Utility class responsible for mapping an {@link Expense} entity
 * to an {@link ExpenseResponseDto}.
 *
 * <p>Used by the service layer to construct the API response body
 * after fetching or mutating an {@link Expense} entity. Since
 * {@link ExpenseResponseDto} is a record, the canonical constructor
 * is used directly instead of a builder.</p>
 *
 * <p>This class is not meant to be instantiated — all methods are static.</p>
 *
 * @author 2480081
 * @version 1.0
 * @since 25-03-2026
 * @see Expense
 * @see ExpenseResponseDto
 */
@Component
public class ExpenseResponseDtoMapper {

    private ExpenseResponseDtoMapper() {
        // Utility class — prevent instantiation
    }

    /**
     * Converts an {@link Expense} entity into an {@link ExpenseResponseDto}
     * to be returned as the API response body.
     *
     * <p>All fields from the entity are mapped directly. The {@code approvedBy}
     * field will be {@code null} if the expense has not yet been approved.</p>
     *
     * @param expense the {@link Expense} entity to convert; must not be {@code null}
     * @return an {@link ExpenseResponseDto} populated with all fields from the entity
     */
    public static ExpenseResponseDto toDto(Expense expense) {
    	return ExpenseResponseDto.builder()
                .expenseId(expense.getExpenseId())
                .eventId(expense.getEventId())
                .description(expense.getDescription())
                .amount(expense.getAmount())
                .date(expense.getDate())
                .approvedBy(expense.getApprovedBy())
                .status(expense.getStatus())
                .createdAt(expense.getCreatedAt())
                .updatedAt(expense.getUpdatedAt())
                .build();
    }
}
