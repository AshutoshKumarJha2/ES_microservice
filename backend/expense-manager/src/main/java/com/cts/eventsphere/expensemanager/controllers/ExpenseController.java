package com.cts.eventsphere.expensemanager.controllers;

import com.cts.eventsphere.expensemanager.dto.request.ExpenseRequestDto;
import com.cts.eventsphere.expensemanager.dto.response.ExpenseResponseDto;
import com.cts.eventsphere.expensemanager.entity.data.ExpenseStatus;
import com.cts.eventsphere.expensemanager.service.ExpenseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.cts.eventsphere.expensemanager.dto.request.PaymentRequestDto;
import com.cts.eventsphere.expensemanager.dto.response.PaymentResponseDto;
import java.util.List;
import com.cts.eventsphere.expensemanager.auth.dto.UserPrincipal;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

/**
 * REST controller for managing expenses in the Finance Service.
 *
 * <p>Exposes endpoints consumed by:</p>
 * <ul>
 *   <li><strong>Finance Manager / Organizer / Admin</strong> — via UI or API gateway</li>
 *   <li><strong>Venue &amp; Vendor Services (Feign)</strong> — call
 *       {@code POST /events/{eventId}/expenses} to record expenses</li>
 * </ul>
 *
 * <p><strong>Note:</strong> {@code actorId} is currently hardcoded as
 * {@code "system"} in each method. Once the IAM team provides the
 * {@code UserPrincipal} format, uncomment the annotated parameter
 * and extract the real actor ID from the JWT token.</p>
 *
 * @author 2480081
 * @version 1.0
 * @since 25-03-2026
 */
@RestController
@RequestMapping("")
@Tag(name = "Expense", description = "Expense management endpoints")
@RequiredArgsConstructor
@Slf4j
public class ExpenseController {

    private final ExpenseService expenseService;

    

    /**
     * Retrieves all expenses in the system.
     */
    @GetMapping("/expenses")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_MANAGER')")
    @Operation(summary = "Get all expenses")
    public ResponseEntity<List<ExpenseResponseDto>> getAllExpenses(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        log.info("Request to fetch all expenses by userId: {}", userPrincipal.userId());
        List<ExpenseResponseDto> response = expenseService.getAllExpenses();
        log.info("Returned {} expenses", response.size());
        return ResponseEntity.ok(response);
    }

    /**
     * Retrieves a paginated list of expenses for a specific event.
     *
     * <p>Supports pagination via query params: {@code ?page=0&size=10&sort=createdAt,desc}</p>
     */
    @GetMapping("/events/{eventId}/expenses")
    @PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER', 'FINANCE_MANAGER')")
    @Operation(summary = "Get expenses for an event (paginated)")
    public ResponseEntity<Page<ExpenseResponseDto>> getEventExpenses(
            @PathVariable String eventId,
            @PageableDefault(size = 10, sort = "createdAt") Pageable pageable,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        log.info("Request to fetch expenses for eventId: {} by userId: {}", eventId, userPrincipal.userId());
        Page<ExpenseResponseDto> response = expenseService.getExpensesByEvent(eventId, pageable);
        log.info("Returned {} expenses for eventId: {}", response.getTotalElements(), eventId);
        return ResponseEntity.ok(response);
    }

    /**
     * Creates a new expense for a specific event.
     *
     * <p>Also called by Venue Service and Vendor Service via Feign
     * to record expenses when bookings or deliveries are confirmed.</p>
     */
    @PostMapping("/events/{eventId}/expenses")
    @PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER', 'FINANCE_MANAGER')")
    @Operation(summary = "Create an expense for an event")
    public ResponseEntity<ExpenseResponseDto> createExpense(
            @PathVariable String eventId,
            @Valid @RequestBody ExpenseRequestDto request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        String actorId = userPrincipal.userId();
        log.info("Creating expense for eventId: {} by actorId: {}", eventId, actorId);
        ExpenseResponseDto response = expenseService.createExpense(actorId, eventId, request);
        log.info("Expense created. expenseId: {}", response.expenseId());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * Approves or rejects an expense.
     *
     * @param status must be APPROVED or REJECTED
     */
    @PatchMapping("/expenses/{expenseId}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_MANAGER')")
    @Operation(summary = "Approve or reject an expense")
    public ResponseEntity<ExpenseResponseDto> updateExpenseStatus(
            @PathVariable String expenseId,
            @RequestParam ExpenseStatus status,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        String actorId = userPrincipal.userId();
        log.info("Updating expenseId: {} to status: {} by actorId: {}", expenseId, status, actorId);
        ExpenseResponseDto response = expenseService.updateExpenseStatus(actorId, expenseId, status);
        log.info("Expense {} updated to {}", expenseId, response.status());
        return ResponseEntity.ok(response);
    }

    /**
     * Processes payment for an approved expense.
     *
     * <p>Transitions expense APPROVED → PAID and updates the event budget.</p>
     */
    @PostMapping("/expenses/{expenseId}/payment")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_MANAGER')")
    @Operation(summary = "Make payment on an approved expense")
    public ResponseEntity<PaymentResponseDto> makePayment(
            @PathVariable String expenseId,
            @Valid @RequestBody PaymentRequestDto request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        String actorId = userPrincipal.userId();
        log.info("Processing payment for expenseId: {} by actorId: {}", expenseId, actorId);
        PaymentResponseDto response = expenseService.makePayment(actorId, expenseId, request);
        log.info("Payment completed. paymentId: {}", response.paymentId());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * Deletes an expense record.
     */
    @DeleteMapping("/expenses/{expenseId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER')")
    @Operation(summary = "Delete an expense")
    public ResponseEntity<Void> deleteExpense(
            @PathVariable String expenseId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        String actorId = userPrincipal.userId();
        log.info("Deleting expenseId: {} by actorId: {}", expenseId, actorId);
        expenseService.deleteExpense(actorId, expenseId);
        log.info("Expense deleted. expenseId: {}", expenseId);
        return ResponseEntity.noContent().build();
    }
}