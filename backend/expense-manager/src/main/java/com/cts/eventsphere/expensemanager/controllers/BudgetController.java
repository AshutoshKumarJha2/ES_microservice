package com.cts.eventsphere.expensemanager.controllers;

import com.cts.eventsphere.expensemanager.dto.request.BudgetRequestDto;
import com.cts.eventsphere.expensemanager.dto.response.BudgetResponseDto;
import com.cts.eventsphere.expensemanager.service.BudgetService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.cts.eventsphere.expensemanager.auth.dto.UserPrincipal;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

/**
 * REST controller for managing event budgets in the Finance Service.
 *
 * <p>Exposes endpoints consumed by:</p>
 * <ul>
 *   <li><strong>Finance Manager / Organizer / Admin</strong> — via the UI or API gateway</li>
 *   <li><strong>Event Service (Feign)</strong> — calls {@code POST /{eventId}/budget}
 *       after an event is created</li>
 * </ul>
 *
 * @author 2480081
 * @version 1.0
 * @since 25-03-2026
 */
@RestController
@RequestMapping("/events")
@Tag(name = "Budget", description = "Budget management endpoints")
@RequiredArgsConstructor
@Slf4j
public class BudgetController {

    private final BudgetService budgetService;

    /**
     * Creates a budget for the specified event.
     *
     * <p>Also called by the Event Service via Feign after event creation.</p>
     *
     * @param eventId the UUID of the event
     * @param request the budget payload containing the planned amount
     * @return the created budget with HTTP 201
     */
    @PostMapping("/{eventId}/budget")
    @PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER', 'FINANCE_MANAGER')")
    @Operation(summary = "Set budget for an event")
    public ResponseEntity<BudgetResponseDto> setBudget(
            @PathVariable String eventId,
            @Valid @RequestBody BudgetRequestDto request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        log.info("Request to set budget for eventId: {} by userId: {} | data: {}", eventId, userPrincipal.userId(), request);
        BudgetResponseDto response = budgetService.createBudget(eventId, request);
        log.info("Budget created for eventId: {}. budgetId: {}", eventId, response.budgetId());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * Retrieves the budget for the specified event.
     *
     * @param eventId the UUID of the event
     * @return the budget details with HTTP 200
     */
    @GetMapping("/{eventId}/budget")
    @PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER', 'FINANCE_MANAGER')")
    @Operation(summary = "Get budget for an event")
    public ResponseEntity<BudgetResponseDto> getBudget(
            @PathVariable String eventId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        log.info("Request to fetch budget for eventId: {} by userId: {}", eventId, userPrincipal.userId());
        BudgetResponseDto response = budgetService.getBudgetByEventId(eventId);
        return ResponseEntity.ok(response);
    }
}