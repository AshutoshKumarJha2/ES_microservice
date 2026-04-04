package com.cts.eventsphere.expensemanager.dto.mapper;

import org.springframework.stereotype.Component;

import com.cts.eventsphere.expensemanager.dto.response.BudgetResponseDto;
import com.cts.eventsphere.expensemanager.entity.Budget;

/**
 * Utility class responsible for mapping a {@link Budget} entity
 * to a {@link BudgetResponseDto}.
 *
 * <p>Used by the service layer to construct the API response body
 * after fetching or mutating a {@link Budget} entity. Since
 * {@link BudgetResponseDto} is a record annotated with Lombok
 * {@code @Builder}, the builder pattern is used here.</p>
 *
 * <p>This class is not meant to be instantiated — all methods are static.</p>
 *
 * @author 2480081
 * @version 1.0
 * @since 25-03-2026
 * @see Budget
 * @see BudgetResponseDto
 */
@Component
public class BudgetResponseDtoMapper {

    private BudgetResponseDtoMapper() {
        // Utility class — prevent instantiation
    }

    /**
     * Converts a {@link Budget} entity into a {@link BudgetResponseDto}
     * to be returned as the API response body.
     *
     * <p>All fields from the entity are mapped directly, including the
     * computed {@code actualAmount} and {@code variance} fields which
     * are managed by the service layer and not accepted from the client.</p>
     *
     * @param budget the {@link Budget} entity to convert; must not be {@code null}
     * @return a {@link BudgetResponseDto} populated with all fields from the entity
     */
    public static BudgetResponseDto toResponseDto(Budget budget) {
        return BudgetResponseDto.builder()
                .budgetId(budget.getBudgetId())
                .eventId(budget.getEventId())
                .plannedAmount(budget.getPlannedAmount())
                .actualAmount(budget.getActualAmount())
                .variance(budget.getVariance())
                .createdAt(budget.getCreatedAt())
                .updatedAt(budget.getUpdatedAt())
                .build();
    }
}
