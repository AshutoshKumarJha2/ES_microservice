package com.cts.eventsphere.expensemanager.service;

import com.cts.eventsphere.expensemanager.dto.request.ExpenseRequestDto;
import com.cts.eventsphere.expensemanager.dto.request.PaymentRequestDto;
import com.cts.eventsphere.expensemanager.dto.response.ExpenseResponseDto;
import com.cts.eventsphere.expensemanager.dto.response.PaymentResponseDto;
import com.cts.eventsphere.expensemanager.entity.data.ExpenseStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

/**
 * Service interface for managing event expenses.
 *
 * <p>Defines the contract for the full expense lifecycle: creation, retrieval,
 * approval/rejection, payment, and deletion. Implementations coordinate with
 * the Event Service (validation) and the internal Budget repository
 * (spend tracking on payment).</p>
 *
 * @author 2480081
 * @version 1.0
 * @since 25-03-2026
 * @see com.cts.eventsphere.expensemanager.service.impl.ExpenseServiceImpl
 */
public interface ExpenseService {

    /**
     * Records a new expense for the given event.
     *
     * @param actorId the UUID of the authenticated user creating the expense
     * @param eventId the UUID of the event this expense belongs to
     * @param request the expense details (description, amount, date)
     * @return the created expense's response DTO with status SUBMITTED
     */
    ExpenseResponseDto createExpense(String actorId, String eventId, ExpenseRequestDto request);

    /**
     * Retrieves all expenses across all events.
     *
     * @return a list of all expense response DTOs
     */
    List<ExpenseResponseDto> getAllExpenses();

    /**
     * Retrieves a paginated list of expenses for the given event.
     *
     * @param eventId  the UUID of the event
     * @param pageable pagination and sorting parameters
     * @return a page of expense response DTOs
     */
    Page<ExpenseResponseDto> getExpensesByEvent(String eventId, Pageable pageable);

    /**
     * Updates the status of an expense to APPROVED or REJECTED.
     *
     * <p>Only expenses in SUBMITTED status can be approved or rejected.
     * When approving, the {@code approvedBy} field is set to the actor's ID.</p>
     *
     * @param actorId   the UUID of the Finance Manager performing the action
     * @param expenseId the UUID of the expense to update
     * @param status    the target status — must be APPROVED or REJECTED
     * @return the updated expense's response DTO
     */
    ExpenseResponseDto updateExpenseStatus(String actorId, String expenseId, ExpenseStatus status);

    /**
     * Processes payment for an approved expense.
     *
     * <p>Creates a {@link com.cts.eventsphere.expensemanager.entity.Payment} record,
     * transitions the expense from APPROVED → PAID, and updates the event's budget:
     * {@code actualAmount += expense.amount},
     * {@code variance = plannedAmount − actualAmount}.</p>
     *
     * @param actorId   the UUID of the Finance Manager triggering payment
     * @param expenseId the UUID of the approved expense to pay
     * @param request   the payment details (amount, method, date)
     * @return the payment response DTO with status COMPLETED
     */
    PaymentResponseDto makePayment(String actorId, String expenseId, PaymentRequestDto request);

    /**
     * Deletes an expense record.
     *
     * @param actorId   the UUID of the authenticated user
     * @param expenseId the UUID of the expense to delete
     */
    void deleteExpense(String actorId, String expenseId);
}