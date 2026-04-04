package com.cts.eventsphere.expensemanager.service;

import com.cts.eventsphere.expensemanager.auth.dto.UserPrincipal;
import com.cts.eventsphere.expensemanager.client.EventServiceClient;
import com.cts.eventsphere.expensemanager.client.LogServiceClient;
import com.cts.eventsphere.expensemanager.client.dto.EventResponseDto;
import com.cts.eventsphere.expensemanager.dto.request.ExpenseRequestDto;
import com.cts.eventsphere.expensemanager.dto.request.PaymentRequestDto;
import com.cts.eventsphere.expensemanager.dto.response.ExpenseResponseDto;
import com.cts.eventsphere.expensemanager.dto.response.PaymentResponseDto;
import com.cts.eventsphere.expensemanager.entity.Budget;
import com.cts.eventsphere.expensemanager.entity.Expense;
import com.cts.eventsphere.expensemanager.entity.Payment;
import com.cts.eventsphere.expensemanager.entity.data.ExpenseStatus;
import com.cts.eventsphere.expensemanager.entity.data.PaymentMethod;
import com.cts.eventsphere.expensemanager.entity.data.PaymentStatus;
import com.cts.eventsphere.expensemanager.exception.BudgetNotFoundException;
import com.cts.eventsphere.expensemanager.exception.EventServiceException;
import com.cts.eventsphere.expensemanager.exception.ExpenseNotFoundException;
import com.cts.eventsphere.expensemanager.exception.InvalidExpenseStateException;
import com.cts.eventsphere.expensemanager.repository.BudgetRepository;
import com.cts.eventsphere.expensemanager.repository.ExpenseRepository;
import com.cts.eventsphere.expensemanager.repository.PaymentRepository;
import com.cts.eventsphere.expensemanager.service.impl.ExpenseServiceImpl;
import feign.FeignException;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ExpenseServiceImplTest {

    @Mock
    private ExpenseRepository expenseRepository;

    @Mock
    private BudgetRepository budgetRepository;

    @Mock
    private EventServiceClient eventServiceClient;

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private AuditService auditService;

    @Mock
    private LogServiceClient logServiceClient;

    @InjectMocks
    private ExpenseServiceImpl expenseService;

    private static final String EVENT_ID = "event-100";
    private static final String ACTOR_ID = "actor-200";
    private static final String EXPENSE_ID = "expense-300";

    @BeforeEach
    void setUpSecurityContext() {
        SecurityContext securityContext = mock(SecurityContext.class);
        Authentication authentication = mock(Authentication.class);
        UserPrincipal principal = new UserPrincipal(ACTOR_ID, "ORGANIZER", List.of());
        lenient().when(securityContext.getAuthentication()).thenReturn(authentication);
        lenient().when(authentication.getPrincipal()).thenReturn(principal);
        SecurityContextHolder.setContext(securityContext);
    }

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    // ─── helpers ──────────────────────────────────────────────────────────────

    private Expense buildExpense(String id, String eventId, ExpenseStatus status) {
        return Expense.builder()
                .expenseId(id)
                .eventId(eventId)
                .description("Test expense")
                .amount(BigDecimal.valueOf(1000))
                .date(LocalDate.now())
                .status(status)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    private Budget buildBudget(String eventId, BigDecimal planned, BigDecimal actual) {
        BigDecimal variance = planned.subtract(actual);
        return Budget.builder()
                .budgetId("budget-1")
                .eventId(eventId)
                .plannedAmount(planned)
                .actualAmount(actual)
                .variance(variance)
                .build();
    }

    // ─── createExpense ────────────────────────────────────────────────────────

    @Test
    void createExpense_success() {
        ExpenseRequestDto request = new ExpenseRequestDto("Catering", BigDecimal.valueOf(1500), LocalDate.now());

        when(eventServiceClient.getEventById(EVENT_ID)).thenReturn(mock(EventResponseDto.class));

        Expense savedExpense = buildExpense(EXPENSE_ID, EVENT_ID, ExpenseStatus.SUBMITTED);
        when(expenseRepository.save(any(Expense.class))).thenReturn(savedExpense);

        ExpenseResponseDto result = expenseService.createExpense(ACTOR_ID, EVENT_ID, request);

        assertThat(result).isNotNull();
        assertThat(result.expenseId()).isEqualTo(EXPENSE_ID);
        assertThat(result.status()).isEqualTo(ExpenseStatus.SUBMITTED);
        verify(expenseRepository).save(any(Expense.class));
    }

    @Test
    void createExpense_eventNotFound_throwsEventServiceException() {
        ExpenseRequestDto request = new ExpenseRequestDto("Catering", BigDecimal.valueOf(500), LocalDate.now());
        when(eventServiceClient.getEventById(EVENT_ID)).thenThrow(FeignException.NotFound.class);

        assertThatThrownBy(() -> expenseService.createExpense(ACTOR_ID, EVENT_ID, request))
                .isInstanceOf(EventServiceException.class);
        verify(expenseRepository, never()).save(any());
    }

    @Test
    void createExpense_eventServiceUnavailable_throwsEventServiceException() {
        ExpenseRequestDto request = new ExpenseRequestDto("Catering", BigDecimal.valueOf(500), LocalDate.now());
        when(eventServiceClient.getEventById(EVENT_ID)).thenThrow(mock(FeignException.class));

        assertThatThrownBy(() -> expenseService.createExpense(ACTOR_ID, EVENT_ID, request))
                .isInstanceOf(EventServiceException.class);
    }

    // ─── getAllExpenses ───────────────────────────────────────────────────────

    @Test
    void getAllExpenses_returnsList() {
        List<Expense> expenses = List.of(
                buildExpense("e1", EVENT_ID, ExpenseStatus.SUBMITTED),
                buildExpense("e2", EVENT_ID, ExpenseStatus.APPROVED)
        );
        when(expenseRepository.findAll()).thenReturn(expenses);

        List<ExpenseResponseDto> result = expenseService.getAllExpenses();

        assertThat(result).hasSize(2);
        assertThat(result.get(0).expenseId()).isEqualTo("e1");
        assertThat(result.get(1).expenseId()).isEqualTo("e2");
    }

    @Test
    void getAllExpenses_emptyList_returnsEmpty() {
        when(expenseRepository.findAll()).thenReturn(List.of());

        List<ExpenseResponseDto> result = expenseService.getAllExpenses();

        assertThat(result).isEmpty();
    }

    // ─── getExpensesByEvent ───────────────────────────────────────────────────

    @Test
    void getExpensesByEvent_success() {
        Pageable pageable = PageRequest.of(0, 10);
        List<Expense> expenses = List.of(buildExpense(EXPENSE_ID, EVENT_ID, ExpenseStatus.SUBMITTED));
        Page<Expense> page = new PageImpl<>(expenses, pageable, 1);

        when(eventServiceClient.getEventById(EVENT_ID)).thenReturn(mock(EventResponseDto.class));
        when(expenseRepository.findByEventId(EVENT_ID, pageable)).thenReturn(page);

        Page<ExpenseResponseDto> result = expenseService.getExpensesByEvent(EVENT_ID, pageable);

        assertThat(result.getTotalElements()).isEqualTo(1);
        assertThat(result.getContent().get(0).expenseId()).isEqualTo(EXPENSE_ID);
    }

    @Test
    void getExpensesByEvent_eventNotFound_throwsEventServiceException() {
        Pageable pageable = PageRequest.of(0, 10);
        when(eventServiceClient.getEventById(EVENT_ID)).thenThrow(FeignException.NotFound.class);

        assertThatThrownBy(() -> expenseService.getExpensesByEvent(EVENT_ID, pageable))
                .isInstanceOf(EventServiceException.class);
    }

    // ─── updateExpenseStatus ─────────────────────────────────────────────────

    @Test
    void updateExpenseStatus_submittedToApproved_success() {
        Expense expense = buildExpense(EXPENSE_ID, EVENT_ID, ExpenseStatus.SUBMITTED);
        when(expenseRepository.findById(EXPENSE_ID)).thenReturn(Optional.of(expense));

        Expense updated = buildExpense(EXPENSE_ID, EVENT_ID, ExpenseStatus.APPROVED);
        updated.setApprovedBy(ACTOR_ID);
        when(expenseRepository.save(any(Expense.class))).thenReturn(updated);

        ExpenseResponseDto result = expenseService.updateExpenseStatus(ACTOR_ID, EXPENSE_ID, ExpenseStatus.APPROVED);

        assertThat(result.status()).isEqualTo(ExpenseStatus.APPROVED);
        assertThat(result.approvedBy()).isEqualTo(ACTOR_ID);
    }

    @Test
    void updateExpenseStatus_submittedToRejected_success() {
        Expense expense = buildExpense(EXPENSE_ID, EVENT_ID, ExpenseStatus.SUBMITTED);
        when(expenseRepository.findById(EXPENSE_ID)).thenReturn(Optional.of(expense));

        Expense updated = buildExpense(EXPENSE_ID, EVENT_ID, ExpenseStatus.REJECTED);
        when(expenseRepository.save(any(Expense.class))).thenReturn(updated);

        ExpenseResponseDto result = expenseService.updateExpenseStatus(ACTOR_ID, EXPENSE_ID, ExpenseStatus.REJECTED);

        assertThat(result.status()).isEqualTo(ExpenseStatus.REJECTED);
    }

    @Test
    void updateExpenseStatus_notSubmitted_throwsInvalidExpenseStateException() {
        Expense expense = buildExpense(EXPENSE_ID, EVENT_ID, ExpenseStatus.APPROVED);
        when(expenseRepository.findById(EXPENSE_ID)).thenReturn(Optional.of(expense));

        assertThatThrownBy(() -> expenseService.updateExpenseStatus(ACTOR_ID, EXPENSE_ID, ExpenseStatus.APPROVED))
                .isInstanceOf(InvalidExpenseStateException.class);
    }

    @Test
    void updateExpenseStatus_invalidTargetStatus_throwsInvalidExpenseStateException() {
        Expense expense = buildExpense(EXPENSE_ID, EVENT_ID, ExpenseStatus.SUBMITTED);
        when(expenseRepository.findById(EXPENSE_ID)).thenReturn(Optional.of(expense));

        assertThatThrownBy(() -> expenseService.updateExpenseStatus(ACTOR_ID, EXPENSE_ID, ExpenseStatus.PAID))
                .isInstanceOf(InvalidExpenseStateException.class);
    }

    @Test
    void updateExpenseStatus_expenseNotFound_throwsExpenseNotFoundException() {
        when(expenseRepository.findById(EXPENSE_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> expenseService.updateExpenseStatus(ACTOR_ID, EXPENSE_ID, ExpenseStatus.APPROVED))
                .isInstanceOf(ExpenseNotFoundException.class);
    }

    // ─── makePayment ─────────────────────────────────────────────────────────

    @Test
    void makePayment_success() {
        Expense expense = buildExpense(EXPENSE_ID, EVENT_ID, ExpenseStatus.APPROVED);
        when(expenseRepository.findById(EXPENSE_ID)).thenReturn(Optional.of(expense));

        Payment savedPayment = Payment.builder()
                .paymentId("payment-1")
                .expense(expense)
                .amount(BigDecimal.valueOf(1000))
                .method(PaymentMethod.BANK_TRANSFER)
                .status(PaymentStatus.COMPLETED)
                .paymentDate(LocalDateTime.now())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        when(paymentRepository.save(any(Payment.class))).thenReturn(savedPayment);
        when(expenseRepository.save(any(Expense.class))).thenReturn(expense);

        Budget budget = buildBudget(EVENT_ID, BigDecimal.valueOf(50000), BigDecimal.ZERO);
        when(budgetRepository.findByEventId(EVENT_ID)).thenReturn(Optional.of(budget));
        when(budgetRepository.save(any(Budget.class))).thenReturn(budget);

        PaymentRequestDto request = new PaymentRequestDto(BigDecimal.valueOf(1000), PaymentMethod.BANK_TRANSFER, LocalDateTime.now());
        PaymentResponseDto result = expenseService.makePayment(ACTOR_ID, EXPENSE_ID, request);

        assertThat(result).isNotNull();
        assertThat(result.paymentId()).isEqualTo("payment-1");
        verify(expenseRepository).save(any(Expense.class));
        verify(budgetRepository).save(any(Budget.class));
    }

    @Test
    void makePayment_expenseNotApproved_throwsInvalidExpenseStateException() {
        Expense expense = buildExpense(EXPENSE_ID, EVENT_ID, ExpenseStatus.SUBMITTED);
        when(expenseRepository.findById(EXPENSE_ID)).thenReturn(Optional.of(expense));

        PaymentRequestDto request = new PaymentRequestDto(BigDecimal.valueOf(1000), PaymentMethod.CASH, LocalDateTime.now());

        assertThatThrownBy(() -> expenseService.makePayment(ACTOR_ID, EXPENSE_ID, request))
                .isInstanceOf(InvalidExpenseStateException.class);
        verify(paymentRepository, never()).save(any());
    }

    @Test
    void makePayment_budgetNotFound_throwsBudgetNotFoundException() {
        Expense expense = buildExpense(EXPENSE_ID, EVENT_ID, ExpenseStatus.APPROVED);
        when(expenseRepository.findById(EXPENSE_ID)).thenReturn(Optional.of(expense));

        Payment savedPayment = Payment.builder()
                .paymentId("payment-2")
                .expense(expense)
                .amount(BigDecimal.valueOf(1000))
                .method(PaymentMethod.CASH)
                .status(PaymentStatus.COMPLETED)
                .paymentDate(LocalDateTime.now())
                .build();
        when(paymentRepository.save(any(Payment.class))).thenReturn(savedPayment);
        when(expenseRepository.save(any(Expense.class))).thenReturn(expense);
        when(budgetRepository.findByEventId(EVENT_ID)).thenReturn(Optional.empty());

        PaymentRequestDto request = new PaymentRequestDto(BigDecimal.valueOf(1000), PaymentMethod.CASH, LocalDateTime.now());

        assertThatThrownBy(() -> expenseService.makePayment(ACTOR_ID, EXPENSE_ID, request))
                .isInstanceOf(BudgetNotFoundException.class);
    }

    @Test
    void makePayment_expenseNotFound_throwsExpenseNotFoundException() {
        when(expenseRepository.findById(EXPENSE_ID)).thenReturn(Optional.empty());
        PaymentRequestDto request = new PaymentRequestDto(BigDecimal.valueOf(1000), PaymentMethod.CASH, LocalDateTime.now());

        assertThatThrownBy(() -> expenseService.makePayment(ACTOR_ID, EXPENSE_ID, request))
                .isInstanceOf(ExpenseNotFoundException.class);
    }

    // ─── deleteExpense ────────────────────────────────────────────────────────

    @Test
    void deleteExpense_success() {
        when(expenseRepository.existsById(EXPENSE_ID)).thenReturn(true);
        doNothing().when(expenseRepository).deleteById(EXPENSE_ID);

        expenseService.deleteExpense(ACTOR_ID, EXPENSE_ID);

        verify(expenseRepository).deleteById(EXPENSE_ID);
    }

    @Test
    void deleteExpense_notFound_throwsExpenseNotFoundException() {
        when(expenseRepository.existsById(EXPENSE_ID)).thenReturn(false);

        assertThatThrownBy(() -> expenseService.deleteExpense(ACTOR_ID, EXPENSE_ID))
                .isInstanceOf(ExpenseNotFoundException.class);
        verify(expenseRepository, never()).deleteById(any());
    }

    // ─── getPaymentStatus ─────────────────────────────────────────────────────

    @Test
    void getPaymentStatus_success() {
        Expense expense = buildExpense(EXPENSE_ID, EVENT_ID, ExpenseStatus.PAID);
        Payment payment = Payment.builder()
                .paymentId("pay-5")
                .expense(expense)
                .status(PaymentStatus.COMPLETED)
                .amount(BigDecimal.valueOf(1000))
                .method(PaymentMethod.BANK_TRANSFER)
                .paymentDate(LocalDateTime.now())
                .build();
        when(paymentRepository.findById("pay-5")).thenReturn(Optional.of(payment));

        String status = expenseService.getPaymentStatus("pay-5");

        assertThat(status).isEqualTo("COMPLETED");
    }

    @Test
    void getPaymentStatus_notFound_throwsExpenseNotFoundException() {
        when(paymentRepository.findById("missing-pay")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> expenseService.getPaymentStatus("missing-pay"))
                .isInstanceOf(ExpenseNotFoundException.class);
    }

    // ─── getCurrentUserId UNKNOWN fallback ───────────────────────────────────

    @Test
    void getExpensesByEvent_nonUserPrincipal_usesUnknownForAudit() {
        SecurityContext sc = mock(SecurityContext.class);
        Authentication auth = mock(Authentication.class);
        when(sc.getAuthentication()).thenReturn(auth);
        when(auth.getPrincipal()).thenReturn("non-user-principal");
        SecurityContextHolder.setContext(sc);

        Pageable pageable = PageRequest.of(0, 10);
        when(eventServiceClient.getEventById(EVENT_ID)).thenReturn(mock(EventResponseDto.class));
        Page<Expense> page = new PageImpl<>(List.of(), pageable, 0);
        when(expenseRepository.findByEventId(EVENT_ID, pageable)).thenReturn(page);

        Page<ExpenseResponseDto> result = expenseService.getExpensesByEvent(EVENT_ID, pageable);

        assertThat(result).isNotNull();
        assertThat(result.getTotalElements()).isZero();
    }

    // ─── notifyUser FeignException swallowed ──────────────────────────────────

    @Test
    void createExpense_notificationFailure_doesNotPropagate() {
        ExpenseRequestDto request = new ExpenseRequestDto("Catering", BigDecimal.valueOf(1500), LocalDate.now());
        when(eventServiceClient.getEventById(EVENT_ID)).thenReturn(mock(EventResponseDto.class));
        Expense savedExpense = buildExpense(EXPENSE_ID, EVENT_ID, ExpenseStatus.SUBMITTED);
        when(expenseRepository.save(any(Expense.class))).thenReturn(savedExpense);
        doThrow(mock(FeignException.class)).when(logServiceClient).sendNotification(any(), any(), any());

        ExpenseResponseDto result = expenseService.createExpense(ACTOR_ID, EVENT_ID, request);

        assertThat(result).isNotNull();
        assertThat(result.expenseId()).isEqualTo(EXPENSE_ID);
    }

    // ─── budget variance update ────────────────────────────────────────────────

    @Test
    void makePayment_updatesbudgetActualAmountAndVariance() {
        Expense expense = buildExpense(EXPENSE_ID, EVENT_ID, ExpenseStatus.APPROVED);
        when(expenseRepository.findById(EXPENSE_ID)).thenReturn(Optional.of(expense));

        Payment savedPayment = Payment.builder()
                .paymentId("payment-v")
                .expense(expense)
                .amount(BigDecimal.valueOf(1000))
                .method(PaymentMethod.BANK_TRANSFER)
                .status(PaymentStatus.COMPLETED)
                .paymentDate(LocalDateTime.now())
                .build();
        when(paymentRepository.save(any(Payment.class))).thenReturn(savedPayment);
        when(expenseRepository.save(any(Expense.class))).thenReturn(expense);

        Budget budget = buildBudget(EVENT_ID, BigDecimal.valueOf(10000), BigDecimal.valueOf(2000));
        when(budgetRepository.findByEventId(EVENT_ID)).thenReturn(Optional.of(budget));
        when(budgetRepository.save(any(Budget.class))).thenAnswer(inv -> inv.getArgument(0));

        PaymentRequestDto request = new PaymentRequestDto(BigDecimal.valueOf(1000), PaymentMethod.BANK_TRANSFER, LocalDateTime.now());
        expenseService.makePayment(ACTOR_ID, EXPENSE_ID, request);

        // expense.amount is 1000, budget.actualAmount was 2000, so new actualAmount = 3000, variance = 7000
        assertThat(budget.getActualAmount()).isEqualByComparingTo(BigDecimal.valueOf(3000));
        assertThat(budget.getVariance()).isEqualByComparingTo(BigDecimal.valueOf(7000));
    }
}
