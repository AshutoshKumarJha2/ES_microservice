package com.cts.eventsphere.expensemanager.service.impl;

import com.cts.eventsphere.expensemanager.client.EventServiceClient;
import com.cts.eventsphere.expensemanager.client.LogServiceClient;
import com.cts.eventsphere.expensemanager.client.dto.EventResponseDto;
import com.cts.eventsphere.expensemanager.dto.audit.AuditAction;
import com.cts.eventsphere.expensemanager.dto.mapper.ExpenseRequestDtoMapper;
import com.cts.eventsphere.expensemanager.dto.mapper.ExpenseResponseDtoMapper;
import com.cts.eventsphere.expensemanager.dto.request.ExpenseRequestDto;
import com.cts.eventsphere.expensemanager.dto.response.ExpenseResponseDto;
import com.cts.eventsphere.expensemanager.entity.Budget;
import com.cts.eventsphere.expensemanager.entity.Expense;
import com.cts.eventsphere.expensemanager.entity.data.ExpenseStatus;
import com.cts.eventsphere.expensemanager.exception.BudgetNotFoundException;
import com.cts.eventsphere.expensemanager.exception.EventServiceException;
import com.cts.eventsphere.expensemanager.exception.ExpenseNotFoundException;
import com.cts.eventsphere.expensemanager.exception.InvalidExpenseStateException;
import com.cts.eventsphere.expensemanager.repository.BudgetRepository;
import com.cts.eventsphere.expensemanager.repository.ExpenseRepository;
import com.cts.eventsphere.expensemanager.repository.PaymentRepository;
import com.cts.eventsphere.expensemanager.service.AuditService;
import com.cts.eventsphere.expensemanager.service.ExpenseService;
import org.springframework.security.core.context.SecurityContextHolder;
import com.cts.eventsphere.expensemanager.auth.dto.UserPrincipal;

import feign.FeignException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.cts.eventsphere.expensemanager.dto.request.PaymentRequestDto;
import com.cts.eventsphere.expensemanager.dto.response.PaymentResponseDto;
import com.cts.eventsphere.expensemanager.dto.mapper.PaymentRequestDtoMapper;
import com.cts.eventsphere.expensemanager.dto.mapper.PaymentResponseDtoMapper;
import com.cts.eventsphere.expensemanager.entity.Payment;
import java.util.List;

/**
 * Implementation of the {@link ExpenseService} interface.
 *
 * <p><strong>Monolith → Microservice changes:</strong></p>
 * <ul>
 *   <li>{@code EventRepository} → {@link EventServiceClient} (Feign call)</li>
 *   <li>{@code expense.getEvent().getOrganizerId()} → Feign call to get organizerId</li>
 *   <li>{@code getExpensesByEvent} now uses paginated repository query</li>
 *   <li>{@code makePayment} properly updates the event budget on payment</li>
 *   <li>Notification and Audit integrations deferred — will be added later</li>
 * </ul>
 *
 * @author 2480081
 * @version 1.0
 * @since 25-03-2026
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ExpenseServiceImpl implements ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final BudgetRepository budgetRepository;
    private final EventServiceClient eventServiceClient;
    private final PaymentRepository paymentRepository;
    private final AuditService auditService;
    private final LogServiceClient logServiceClient;


    /**
     * {@inheritDoc}
     *
     * <p>Flow:</p>
     * <ol>
     *   <li>Validate event exists via Feign (replaces {@code eventRepository.findById})</li>
     *   <li>Map request DTO → Expense entity with status SUBMITTED</li>
     *   <li>Persist the expense</li>
     * </ol>
     */
    @Override
    @Transactional
    public ExpenseResponseDto createExpense(String actorId, String eventId, ExpenseRequestDto request) {
        log.info("Creating expense for eventId: {} by actorId: {} | details: {}", eventId, actorId, request);

        
        fetchEvent(eventId);

        
        Expense expense = ExpenseRequestDtoMapper.toEntity(request, eventId);

        
        Expense savedExpense = expenseRepository.save(expense);
        log.info("Expense created. expenseId: {}, eventId: {}", savedExpense.getExpenseId(), eventId);
        auditService.logAudit(actorId, AuditAction.CREATE, Expense.class, expense.getExpenseId());
        notifyUser(actorId, "Expense \"" + request.description() + "\" submitted for event \"" + eventId + "\"");
        return ExpenseResponseDtoMapper.toDto(savedExpense);
    }

    

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional(readOnly = true)
    public List<ExpenseResponseDto> getAllExpenses() {
        log.info("Fetching all expenses");
        List<ExpenseResponseDto> expenses = expenseRepository.findAll().stream()
                .map(ExpenseResponseDtoMapper::toDto)
                .toList();
        log.info("Retrieved {} expenses in total", expenses.size());
        return expenses;
    }

    /**
     * {@inheritDoc}
     *
     * <p>Uses the paginated {@code findByEventId} repository method
     * instead of the monolith's in-memory filter on {@code findAll()}.</p>
     */
    @Override
    @Transactional(readOnly = true)
    public Page<ExpenseResponseDto> getExpensesByEvent(String eventId, Pageable pageable) {
        log.info("Fetching expenses for eventId: {} | page: {}, size: {}",
                eventId, pageable.getPageNumber(), pageable.getPageSize());

        
        fetchEvent(eventId);
        
        Page<ExpenseResponseDto> expenses = expenseRepository.findByEventId(eventId, pageable)
                .map(ExpenseResponseDtoMapper::toDto);
        log.info("Retrieved {} expenses for eventId: {}", expenses.getTotalElements(), eventId);
        auditService.logAudit(getCurrentUserId(), AuditAction.READ, "Expense", "ALL");
        return expenses;
    }

    

    /**
     * {@inheritDoc}
     *
     * <p>Only allows transitions from SUBMITTED → APPROVED or SUBMITTED → REJECTED.
     * When approving, the {@code approvedBy} field is stamped with the actor's ID.</p>
     */
    @Override
    @Transactional
    public ExpenseResponseDto updateExpenseStatus(String actorId, String expenseId, ExpenseStatus status) {
        log.info("Updating expenseId: {} to status: {} by actorId: {}", expenseId, status, actorId);

        Expense expense = findExpenseOrThrow(expenseId);

        
        if (expense.getStatus() != ExpenseStatus.SUBMITTED) {
            throw new InvalidExpenseStateException(expenseId, expense.getStatus(), status);
        }

        
        if (status != ExpenseStatus.APPROVED && status != ExpenseStatus.REJECTED) {
            throw new InvalidExpenseStateException(expenseId, expense.getStatus(), status);
        }

        expense.setStatus(status);

        if (status == ExpenseStatus.APPROVED) {
            expense.setApprovedBy(actorId);
        }

        Expense updatedExpense = expenseRepository.save(expense);
        log.info("Expense {} updated to status: {}", expenseId, status);
        AuditAction statusAction = switch (status) {
        case APPROVED -> AuditAction.APPROVE;
        case REJECTED -> AuditAction.REJECT;
        default -> AuditAction.UPDATE;
    };
    auditService.logAudit(actorId, statusAction, Expense.class, expense.getExpenseId());
    notifyUser(actorId, "Expense \"" + expense.getDescription() + "\" status changed to " + status);
        

        return ExpenseResponseDtoMapper.toDto(updatedExpense);
    }

    

    /**
     * {@inheritDoc}
     *
     * <p>Flow (per Migration Guide Step 4):</p>
     * <ol>
     *   <li>Validate expense exists and is in APPROVED status</li>
     *   <li>Transition expense to PAID</li>
     *   <li>Update the event budget: actualAmount += expense.amount,
     *       variance = plannedAmount − actualAmount</li>
     *   <li>Persist both expense and budget</li>
     * </ol>
     */
    @Override
    @Transactional
    public PaymentResponseDto makePayment(String actorId, String expenseId, PaymentRequestDto request) {
        log.info("Processing payment for expenseId: {} by actorId: {} | details: {}", expenseId, actorId, request);

        Expense expense = findExpenseOrThrow(expenseId);

        
        if (expense.getStatus() != ExpenseStatus.APPROVED) {
            throw new InvalidExpenseStateException(expenseId, expense.getStatus(), ExpenseStatus.PAID);
        }

        
        Payment payment = PaymentRequestDtoMapper.toEntity(request, expense);
        Payment savedPayment = paymentRepository.save(payment);
        log.info("Payment record created. paymentId: {}", savedPayment.getPaymentId());

        
        expense.setStatus(ExpenseStatus.PAID);
        expenseRepository.save(expense);
        auditService.logAudit(actorId, AuditAction.CREATE, Payment.class, payment.getPaymentId());
        notifyUser(actorId, "Payment of " + request.amount() + " processed for expense \"" + expense.getDescription() + "\"");
        
        Budget budget = budgetRepository.findByEventId(expense.getEventId())
                .orElseThrow(() -> new BudgetNotFoundException(expense.getEventId()));

        budget.setActualAmount(budget.getActualAmount().add(expense.getAmount()));
        budget.setVariance(budget.getPlannedAmount().subtract(budget.getActualAmount()));
        budgetRepository.save(budget);

        log.info("Payment processed. expenseId: {}, paymentId: {}, amount: {} | Budget — actual: {}, variance: {}",
                expenseId, savedPayment.getPaymentId(), expense.getAmount(),
                budget.getActualAmount(), budget.getVariance());

        

        return PaymentResponseDtoMapper.toDto(savedPayment);
    }
    

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional
    public void deleteExpense(String actorId, String expenseId) {
        log.info("Deleting expenseId: {} by actorId: {}", expenseId, actorId);

        if (!expenseRepository.existsById(expenseId)) {
            throw new ExpenseNotFoundException(expenseId);
        }

        expenseRepository.deleteById(expenseId);
        log.info("Expense deleted. expenseId: {}", expenseId);
        auditService.logAudit(actorId, AuditAction.DELETE, Expense.class, expenseId);

    }

    

    private Expense findExpenseOrThrow(String expenseId) {
        return expenseRepository.findById(expenseId)
                .orElseThrow(() -> new ExpenseNotFoundException(expenseId));
    }

    private EventResponseDto fetchEvent(String eventId) {
        try {
            return eventServiceClient.getEventById(eventId);
        } catch (FeignException.NotFound ex) {
            log.error("Event not found via Event Service: {}", eventId);
            throw new EventServiceException("Event not found: " + eventId, ex);
        } catch (FeignException ex) {
            log.error("Event Service unreachable while validating eventId: {}", eventId, ex);
            throw new EventServiceException("Event Service unavailable", ex);
        }
    }
    
    private static final String NOTIFICATION_CATEGORY = "EXPENSE";

    private void notifyUser(String userId, String message) {
        try {
            logServiceClient.sendNotification(userId, message, NOTIFICATION_CATEGORY);
        } catch (FeignException e) {
            log.warn("Failed to send notification to user {}: {}", userId, e.getMessage());
        }
    }
    
    private String getCurrentUserId() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserPrincipal userPrincipal) {
            return userPrincipal.userId();
        }
        return "UNKNOWN";
    }


}