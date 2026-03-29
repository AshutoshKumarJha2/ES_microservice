package com.cts.eventsphere.expensemanager.service.impl;

import com.cts.eventsphere.expensemanager.client.EventServiceClient;
import com.cts.eventsphere.expensemanager.client.LogServiceClient;
import com.cts.eventsphere.expensemanager.client.dto.EventResponseDto;
import com.cts.eventsphere.expensemanager.dto.mapper.BudgetRequestDtoMapper;
import com.cts.eventsphere.expensemanager.dto.mapper.BudgetResponseDtoMapper;
import com.cts.eventsphere.expensemanager.dto.request.BudgetRequestDto;
import com.cts.eventsphere.expensemanager.dto.response.BudgetResponseDto;
import com.cts.eventsphere.expensemanager.entity.Budget;
import com.cts.eventsphere.expensemanager.exception.BudgetAlreadyExistsException;
import com.cts.eventsphere.expensemanager.exception.BudgetNotFoundException;
import com.cts.eventsphere.expensemanager.exception.EventServiceException;
import com.cts.eventsphere.expensemanager.repository.BudgetRepository;
import com.cts.eventsphere.expensemanager.service.AuditService;
import com.cts.eventsphere.expensemanager.dto.audit.AuditAction;
import com.cts.eventsphere.expensemanager.service.BudgetService;
import org.springframework.security.core.context.SecurityContextHolder;
import com.cts.eventsphere.expensemanager.auth.dto.UserPrincipal;

import feign.FeignException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Implementation of the {@link BudgetService} interface.
 *
 * <p><strong>Monolith → Microservice changes:</strong></p>
 * <ul>
 *   <li>{@code EventRepository} replaced with {@link EventServiceClient} (Feign)</li>
 *   <li>No direct JPA relation to Event — only {@code eventId} (plain String)</li>
 *   <li>Notification Service integration deferred — will be added later</li>
 * </ul>
 *
 * @author 2480081
 * @version 1.0
 * @since 25-03-2026
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class BudgetServiceImpl implements BudgetService {

    private final BudgetRepository budgetRepository;
    private final EventServiceClient eventServiceClient;
    private final AuditService auditService;
    private final LogServiceClient logServiceClient;
    /**
     * {@inheritDoc}
     *
     * <p>Flow:</p>
     * <ol>
     *   <li>Validate event exists via Feign call to Event Service</li>
     *   <li>Ensure no duplicate budget for this event</li>
     *   <li>Map DTO → entity, set variance = plannedAmount (since actualAmount starts at 0)</li>
     *   <li>Persist the budget</li>
     * </ol>
     */
    @Override
    @Transactional
    public BudgetResponseDto createBudget(String eventId, BudgetRequestDto request) {
        log.info("Creating budget for eventId: {} with plannedAmount: {}", eventId, request.plannedAmount());
        fetchEvent(eventId);
        budgetRepository.findByEventId(eventId).ifPresent(existing -> {
            throw new BudgetAlreadyExistsException(eventId);
        });
        Budget budget = BudgetRequestDtoMapper.toEntity(request, eventId);
        budget.setVariance(request.plannedAmount());
        Budget savedBudget = budgetRepository.save(budget);
        auditService.logAudit(getCurrentUserId(), AuditAction.CREATE, Budget.class, savedBudget.getBudgetId());
        notifyUser(getCurrentUserId(), "Budget created for event \"" + eventId + "\" with planned amount: " + request.plannedAmount());
        log.info("Budget created successfully. budgetId: {}, eventId: {}", savedBudget.getBudgetId(), eventId);
        return BudgetResponseDtoMapper.toResponseDto(savedBudget);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional(readOnly = true)
    public BudgetResponseDto getBudgetByEventId(String eventId) {
        log.info("Fetching budget for eventId: {}", eventId);
        Budget budget = budgetRepository.findByEventId(eventId)
                .orElseThrow(() -> new BudgetNotFoundException(eventId));
        auditService.logAudit(getCurrentUserId(), AuditAction.READ, Budget.class, budget.getBudgetId());
        return BudgetResponseDtoMapper.toResponseDto(budget);
    }

    

    /**
     * Calls the Event Service to retrieve event details.
     * Translates Feign exceptions into domain-specific exceptions.
     */
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