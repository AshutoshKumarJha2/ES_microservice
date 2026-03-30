package com.cts.eventsphere.expensemanager.controller;

import com.cts.eventsphere.expensemanager.auth.dto.UserPrincipal;
import com.cts.eventsphere.expensemanager.controllers.ExpenseController;
import com.cts.eventsphere.expensemanager.dto.request.ExpenseRequestDto;
import com.cts.eventsphere.expensemanager.dto.request.PaymentRequestDto;
import com.cts.eventsphere.expensemanager.dto.response.ExpenseResponseDto;
import com.cts.eventsphere.expensemanager.dto.response.PaymentResponseDto;
import com.cts.eventsphere.expensemanager.entity.data.ExpenseStatus;
import com.cts.eventsphere.expensemanager.entity.data.PaymentMethod;
import com.cts.eventsphere.expensemanager.entity.data.PaymentStatus;
import com.cts.eventsphere.expensemanager.service.ExpenseService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ExpenseControllerTest {

    @Mock
    private ExpenseService expenseService;

    @InjectMocks
    private ExpenseController expenseController;

    private final UserPrincipal user = new UserPrincipal("actor-1", "FINANCE_MANAGER", List.of());

    private ExpenseResponseDto buildExpenseResponse(String id) {
        return ExpenseResponseDto.builder()
                .expenseId(id)
                .eventId("event-1")
                .description("Catering")
                .amount(BigDecimal.valueOf(500))
                .date(LocalDate.now())
                .status(ExpenseStatus.SUBMITTED)
                .build();
    }

    @Test
    void getAllExpenses_returns200WithList() {
        List<ExpenseResponseDto> expenses = List.of(buildExpenseResponse("exp-1"));
        when(expenseService.getAllExpenses()).thenReturn(expenses);

        ResponseEntity<List<ExpenseResponseDto>> response = expenseController.getAllExpenses(user);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).hasSize(1);
    }

    @Test
    void getEventExpenses_returns200WithPage() {
        Page<ExpenseResponseDto> page = new PageImpl<>(List.of(buildExpenseResponse("exp-1")));
        when(expenseService.getExpensesByEvent(eq("event-1"), any())).thenReturn(page);

        ResponseEntity<Page<ExpenseResponseDto>> response = expenseController.getEventExpenses(
                "event-1", PageRequest.of(0, 10), user);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getTotalElements()).isEqualTo(1);
    }

    @Test
    void createExpense_returns201WithBody() {
        ExpenseRequestDto request = new ExpenseRequestDto("Catering", BigDecimal.valueOf(500), LocalDate.now());
        ExpenseResponseDto expected = buildExpenseResponse("exp-1");
        when(expenseService.createExpense("actor-1", "event-1", request)).thenReturn(expected);

        ResponseEntity<ExpenseResponseDto> response = expenseController.createExpense("event-1", request, user);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).isEqualTo(expected);
    }

    @Test
    void updateExpenseStatus_returns200WithBody() {
        ExpenseResponseDto expected = buildExpenseResponse("exp-1");
        when(expenseService.updateExpenseStatus("actor-1", "exp-1", ExpenseStatus.APPROVED)).thenReturn(expected);

        ResponseEntity<ExpenseResponseDto> response = expenseController.updateExpenseStatus("exp-1", ExpenseStatus.APPROVED, user);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo(expected);
    }

    @Test
    void makePayment_returns201WithBody() {
        PaymentRequestDto request = new PaymentRequestDto(BigDecimal.valueOf(500), PaymentMethod.CASH, LocalDateTime.now());
        PaymentResponseDto expected = PaymentResponseDto.builder()
                .paymentId("pay-1")
                .expenseId("exp-1")
                .amount(BigDecimal.valueOf(500))
                .method(PaymentMethod.CASH)
                .status(PaymentStatus.COMPLETED)
                .build();
        when(expenseService.makePayment("actor-1", "exp-1", request)).thenReturn(expected);

        ResponseEntity<PaymentResponseDto> response = expenseController.makePayment("exp-1", request, user);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).isEqualTo(expected);
    }

    @Test
    void getPaymentStatus_returns200WithStatus() {
        when(expenseService.getPaymentStatus("pay-1")).thenReturn("COMPLETED");

        ResponseEntity<String> response = expenseController.getPaymentStatus("pay-1");

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo("COMPLETED");
    }

    @Test
    void deleteExpense_returns204() {
        doNothing().when(expenseService).deleteExpense("actor-1", "exp-1");

        ResponseEntity<Void> response = expenseController.deleteExpense("exp-1", user);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);
        verify(expenseService).deleteExpense("actor-1", "exp-1");
    }
}
