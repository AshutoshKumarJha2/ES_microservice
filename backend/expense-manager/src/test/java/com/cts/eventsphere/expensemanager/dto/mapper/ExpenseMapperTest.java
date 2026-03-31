package com.cts.eventsphere.expensemanager.dto.mapper;

import com.cts.eventsphere.expensemanager.dto.request.ExpenseRequestDto;
import com.cts.eventsphere.expensemanager.dto.response.ExpenseResponseDto;
import com.cts.eventsphere.expensemanager.entity.Expense;
import com.cts.eventsphere.expensemanager.entity.data.ExpenseStatus;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

class ExpenseMapperTest {

    @Test
    void expenseRequestDtoMapper_toEntity_setsStatusSubmitted() {
        ExpenseRequestDto dto = new ExpenseRequestDto("Catering", BigDecimal.valueOf(1500), LocalDate.now());
        String eventId = "event-100";

        Expense result = ExpenseRequestDtoMapper.toEntity(dto, eventId);

        assertThat(result.getEventId()).isEqualTo(eventId);
        assertThat(result.getDescription()).isEqualTo("Catering");
        assertThat(result.getAmount()).isEqualByComparingTo(BigDecimal.valueOf(1500));
        assertThat(result.getDate()).isEqualTo(dto.date());
        assertThat(result.getStatus()).isEqualTo(ExpenseStatus.SUBMITTED);
        assertThat(result.getApprovedBy()).isNull();
    }

    @Test
    void expenseResponseDtoMapper_toDto_mapsAllFields() {
        LocalDateTime now = LocalDateTime.now();
        Expense expense = Expense.builder()
                .expenseId("expense-abc")
                .eventId("event-100")
                .description("Stage setup")
                .amount(BigDecimal.valueOf(2500))
                .date(LocalDate.now())
                .approvedBy("approver-1")
                .status(ExpenseStatus.APPROVED)
                .createdAt(now)
                .updatedAt(now)
                .build();

        ExpenseResponseDto result = ExpenseResponseDtoMapper.toDto(expense);

        assertThat(result.expenseId()).isEqualTo("expense-abc");
        assertThat(result.eventId()).isEqualTo("event-100");
        assertThat(result.description()).isEqualTo("Stage setup");
        assertThat(result.amount()).isEqualByComparingTo(BigDecimal.valueOf(2500));
        assertThat(result.approvedBy()).isEqualTo("approver-1");
        assertThat(result.status()).isEqualTo(ExpenseStatus.APPROVED);
        assertThat(result.createdAt()).isEqualTo(now);
        assertThat(result.updatedAt()).isEqualTo(now);
    }

    @Test
    void expenseResponseDtoMapper_toDto_approvedByIsNullWhenNotApproved() {
        Expense expense = Expense.builder()
                .expenseId("expense-xyz")
                .eventId("event-200")
                .description("Lighting")
                .amount(BigDecimal.valueOf(800))
                .date(LocalDate.now())
                .status(ExpenseStatus.SUBMITTED)
                .build();

        ExpenseResponseDto result = ExpenseResponseDtoMapper.toDto(expense);

        assertThat(result.approvedBy()).isNull();
    }
}
