package com.cts.eventsphere.expensemanager.dto.mapper;

import java.math.BigDecimal;

import org.springframework.stereotype.Component;

import com.cts.eventsphere.expensemanager.dto.request.BudgetRequestDto;
import com.cts.eventsphere.expensemanager.entity.Budget;

/**
 * Utility class responsible for mapping a {@link BudgetRequestDto}
 * to a {@link Budget} entity.
 *
 * <p>Used by the service layer to construct a new {@link Budget} entity
 * from the incoming request DTO before persisting it. Since {@link Budget}
 * is a regular class annotated with Lombok {@code @Builder}, the builder
 * pattern is used here.</p>
 *
 * <p>This class is not meant to be instantiated — all methods are static.</p>
 *
 * @author 2480081
 * @version 1.0
 * @since 25-03-2026
 * @see Budget
 * @see BudgetRequestDto
 */
@Component
public class BudgetRequestDtoMapper {

    private BudgetRequestDtoMapper() {
        // Utility class — prevent instantiation
    }

    /**
     * Converts a {@link BudgetRequestDto} and a given {@code eventId} into
     * a new {@link Budget} entity ready to be persisted.
     *
     * <p>The following fields are explicitly initialized to safe defaults:</p>
     * <ul>
     *   <li>{@code actualAmount} — set to {@link BigDecimal#ZERO} as no expenses
     *       have been approved at the time of budget creation</li>
     *   <li>{@code variance} — set to {@link BigDecimal#ZERO} since it equals
     *       {@code plannedAmount - actualAmount} and {@code actualAmount} starts at 0</li>
     *   <li>{@code budgetId}, {@code createdAt}, {@code updatedAt} — managed by JPA/Hibernate</li>
     * </ul>
     *
     * @param dto     the incoming request DTO containing the planned amount; must not be {@code null}
     * @param eventId the UUID of the event this budget belongs to; must not be {@code null}
     * @return a new {@link Budget} entity populated with the DTO fields and default values
     */
    public static Budget toEntity(BudgetRequestDto dto, String eventId) {
        return Budget.builder()
                .eventId(eventId)
                .plannedAmount(dto.plannedAmount())
                .actualAmount(BigDecimal.ZERO)
                .variance(BigDecimal.ZERO)
                .build();
    }
}