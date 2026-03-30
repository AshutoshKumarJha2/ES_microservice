package com.cts.eventsphere.expensemanager.dto.mapper;

import com.cts.eventsphere.expensemanager.dto.request.BudgetRequestDto;
import com.cts.eventsphere.expensemanager.dto.response.BudgetResponseDto;
import com.cts.eventsphere.expensemanager.entity.Budget;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

class BudgetMapperTest {

    @Test
    void budgetRequestDtoMapper_toEntity_mapsAllFields() {
        BudgetRequestDto dto = new BudgetRequestDto(BigDecimal.valueOf(75000));
        String eventId = "event-abc";

        Budget result = BudgetRequestDtoMapper.toEntity(dto, eventId);

        assertThat(result.getEventId()).isEqualTo(eventId);
        assertThat(result.getPlannedAmount()).isEqualByComparingTo(BigDecimal.valueOf(75000));
        assertThat(result.getActualAmount()).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(result.getVariance()).isEqualByComparingTo(BigDecimal.ZERO);
    }

    @Test
    void budgetResponseDtoMapper_toResponseDto_mapsAllFields() {
        LocalDateTime now = LocalDateTime.now();
        Budget budget = Budget.builder()
                .budgetId("budget-xyz")
                .eventId("event-abc")
                .plannedAmount(BigDecimal.valueOf(75000))
                .actualAmount(BigDecimal.valueOf(10000))
                .variance(BigDecimal.valueOf(65000))
                .createdAt(now)
                .updatedAt(now)
                .build();

        BudgetResponseDto result = BudgetResponseDtoMapper.toResponseDto(budget);

        assertThat(result.budgetId()).isEqualTo("budget-xyz");
        assertThat(result.eventId()).isEqualTo("event-abc");
        assertThat(result.plannedAmount()).isEqualByComparingTo(BigDecimal.valueOf(75000));
        assertThat(result.actualAmount()).isEqualByComparingTo(BigDecimal.valueOf(10000));
        assertThat(result.variance()).isEqualByComparingTo(BigDecimal.valueOf(65000));
        assertThat(result.createdAt()).isEqualTo(now);
        assertThat(result.updatedAt()).isEqualTo(now);
    }
}
