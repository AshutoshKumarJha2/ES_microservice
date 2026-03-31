package com.cts.eventsphere.expensemanager.service;

import com.cts.eventsphere.expensemanager.auth.dto.UserPrincipal;
import com.cts.eventsphere.expensemanager.client.EventServiceClient;
import com.cts.eventsphere.expensemanager.client.LogServiceClient;
import com.cts.eventsphere.expensemanager.client.dto.EventResponseDto;
import com.cts.eventsphere.expensemanager.dto.request.BudgetRequestDto;
import com.cts.eventsphere.expensemanager.dto.response.BudgetResponseDto;
import com.cts.eventsphere.expensemanager.entity.Budget;
import com.cts.eventsphere.expensemanager.exception.BudgetAlreadyExistsException;
import com.cts.eventsphere.expensemanager.exception.BudgetNotFoundException;
import com.cts.eventsphere.expensemanager.exception.EventServiceException;
import com.cts.eventsphere.expensemanager.repository.BudgetRepository;
import com.cts.eventsphere.expensemanager.service.impl.BudgetServiceImpl;
import feign.FeignException;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BudgetServiceImplTest {

    @Mock
    private BudgetRepository budgetRepository;

    @Mock
    private EventServiceClient eventServiceClient;

    @Mock
    private AuditService auditService;

    @Mock
    private LogServiceClient logServiceClient;

    @InjectMocks
    private BudgetServiceImpl budgetService;

    private static final String EVENT_ID = "event-123";
    private static final String ACTOR_ID = "user-456";

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

    // ─── createBudget ──────────────────────────────────────────────────────────

    @Test
    void createBudget_success() {
        BudgetRequestDto request = new BudgetRequestDto(BigDecimal.valueOf(50000));

        EventResponseDto eventResponse = mock(EventResponseDto.class);
        when(eventServiceClient.getEventById(EVENT_ID)).thenReturn(eventResponse);
        when(budgetRepository.findByEventId(EVENT_ID)).thenReturn(Optional.empty());

        Budget savedBudget = Budget.builder()
                .budgetId("budget-1")
                .eventId(EVENT_ID)
                .plannedAmount(BigDecimal.valueOf(50000))
                .actualAmount(BigDecimal.ZERO)
                .variance(BigDecimal.valueOf(50000))
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        when(budgetRepository.save(any(Budget.class))).thenReturn(savedBudget);

        BudgetResponseDto result = budgetService.createBudget(EVENT_ID, request);

        assertThat(result).isNotNull();
        assertThat(result.budgetId()).isEqualTo("budget-1");
        assertThat(result.eventId()).isEqualTo(EVENT_ID);
        assertThat(result.plannedAmount()).isEqualByComparingTo(BigDecimal.valueOf(50000));
        verify(budgetRepository).save(any(Budget.class));
    }

    @Test
    void createBudget_eventNotFound_throwsEventServiceException() {
        BudgetRequestDto request = new BudgetRequestDto(BigDecimal.valueOf(50000));
        when(eventServiceClient.getEventById(EVENT_ID))
                .thenThrow(FeignException.NotFound.class);

        assertThatThrownBy(() -> budgetService.createBudget(EVENT_ID, request))
                .isInstanceOf(EventServiceException.class);
        verify(budgetRepository, never()).save(any());
    }

    @Test
    void createBudget_eventServiceUnavailable_throwsEventServiceException() {
        BudgetRequestDto request = new BudgetRequestDto(BigDecimal.valueOf(50000));
        FeignException feignEx = mock(FeignException.class);
        when(eventServiceClient.getEventById(EVENT_ID)).thenThrow(feignEx);

        assertThatThrownBy(() -> budgetService.createBudget(EVENT_ID, request))
                .isInstanceOf(EventServiceException.class);
        verify(budgetRepository, never()).save(any());
    }

    @Test
    void createBudget_budgetAlreadyExists_throwsBudgetAlreadyExistsException() {
        BudgetRequestDto request = new BudgetRequestDto(BigDecimal.valueOf(50000));

        EventResponseDto eventResponse = mock(EventResponseDto.class);
        when(eventServiceClient.getEventById(EVENT_ID)).thenReturn(eventResponse);

        Budget existing = Budget.builder().budgetId("existing-budget").eventId(EVENT_ID).build();
        when(budgetRepository.findByEventId(EVENT_ID)).thenReturn(Optional.of(existing));

        assertThatThrownBy(() -> budgetService.createBudget(EVENT_ID, request))
                .isInstanceOf(BudgetAlreadyExistsException.class);
        verify(budgetRepository, never()).save(any());
    }

    @Test
    void createBudget_notificationFailure_doesNotPropagateException() {
        BudgetRequestDto request = new BudgetRequestDto(BigDecimal.valueOf(10000));

        EventResponseDto eventResponse = mock(EventResponseDto.class);
        when(eventServiceClient.getEventById(EVENT_ID)).thenReturn(eventResponse);
        when(budgetRepository.findByEventId(EVENT_ID)).thenReturn(Optional.empty());

        Budget savedBudget = Budget.builder()
                .budgetId("budget-2")
                .eventId(EVENT_ID)
                .plannedAmount(BigDecimal.valueOf(10000))
                .actualAmount(BigDecimal.ZERO)
                .variance(BigDecimal.valueOf(10000))
                .build();
        when(budgetRepository.save(any(Budget.class))).thenReturn(savedBudget);

        FeignException feignEx = mock(FeignException.class);
        doThrow(feignEx).when(logServiceClient).sendNotification(any(), any(), any());

        BudgetResponseDto result = budgetService.createBudget(EVENT_ID, request);

        assertThat(result).isNotNull();
    }

    // ─── getBudgetByEventId ────────────────────────────────────────────────────

    @Test
    void getBudgetByEventId_success() {
        Budget budget = Budget.builder()
                .budgetId("budget-10")
                .eventId(EVENT_ID)
                .plannedAmount(BigDecimal.valueOf(20000))
                .actualAmount(BigDecimal.valueOf(5000))
                .variance(BigDecimal.valueOf(15000))
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        when(budgetRepository.findByEventId(EVENT_ID)).thenReturn(Optional.of(budget));

        BudgetResponseDto result = budgetService.getBudgetByEventId(EVENT_ID);

        assertThat(result).isNotNull();
        assertThat(result.budgetId()).isEqualTo("budget-10");
        assertThat(result.plannedAmount()).isEqualByComparingTo(BigDecimal.valueOf(20000));
        assertThat(result.actualAmount()).isEqualByComparingTo(BigDecimal.valueOf(5000));
        assertThat(result.variance()).isEqualByComparingTo(BigDecimal.valueOf(15000));
    }

    @Test
    void getBudgetByEventId_notFound_throwsBudgetNotFoundException() {
        when(budgetRepository.findByEventId(EVENT_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> budgetService.getBudgetByEventId(EVENT_ID))
                .isInstanceOf(BudgetNotFoundException.class);
    }

    @Test
    void getBudgetByEventId_nonUserPrincipal_usesUnknownForAudit() {
        SecurityContext sc = mock(SecurityContext.class);
        Authentication auth = mock(Authentication.class);
        when(sc.getAuthentication()).thenReturn(auth);
        when(auth.getPrincipal()).thenReturn("anonymous-string-principal");
        SecurityContextHolder.setContext(sc);

        Budget budget = Budget.builder()
                .budgetId("budget-10")
                .eventId(EVENT_ID)
                .plannedAmount(BigDecimal.valueOf(20000))
                .actualAmount(BigDecimal.valueOf(5000))
                .variance(BigDecimal.valueOf(15000))
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        when(budgetRepository.findByEventId(EVENT_ID)).thenReturn(Optional.of(budget));

        BudgetResponseDto result = budgetService.getBudgetByEventId(EVENT_ID);

        assertThat(result).isNotNull();
        assertThat(result.budgetId()).isEqualTo("budget-10");
    }
}
