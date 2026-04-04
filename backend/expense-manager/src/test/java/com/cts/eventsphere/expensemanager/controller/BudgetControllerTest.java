package com.cts.eventsphere.expensemanager.controller;

import com.cts.eventsphere.expensemanager.auth.dto.UserPrincipal;
import com.cts.eventsphere.expensemanager.controllers.BudgetController;
import com.cts.eventsphere.expensemanager.dto.request.BudgetRequestDto;
import com.cts.eventsphere.expensemanager.dto.response.BudgetResponseDto;
import com.cts.eventsphere.expensemanager.service.BudgetService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BudgetControllerTest {

    @Mock
    private BudgetService budgetService;

    @InjectMocks
    private BudgetController budgetController;

    private final UserPrincipal user = new UserPrincipal("user-1", "FINANCE_MANAGER", List.of());

    @Test
    void setBudget_returns201WithBody() {
        BudgetRequestDto request = new BudgetRequestDto(BigDecimal.valueOf(50000));
        BudgetResponseDto expectedResponse = new BudgetResponseDto("budget-1", "event-1", BigDecimal.valueOf(50000), BigDecimal.ZERO, BigDecimal.valueOf(50000), null, null);
        when(budgetService.createBudget("event-1", request)).thenReturn(expectedResponse);

        ResponseEntity<BudgetResponseDto> response = budgetController.setBudget("event-1", request, user);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).isEqualTo(expectedResponse);
    }

    @Test
    void getBudget_returns200WithBody() {
        BudgetResponseDto expectedResponse = new BudgetResponseDto("budget-1", "event-1", BigDecimal.valueOf(50000), BigDecimal.ZERO, BigDecimal.valueOf(50000), null, null);
        when(budgetService.getBudgetByEventId("event-1")).thenReturn(expectedResponse);

        ResponseEntity<BudgetResponseDto> response = budgetController.getBudget("event-1", user);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo(expectedResponse);
    }
}
