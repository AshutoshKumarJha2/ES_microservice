package com.cts.eventsphere.expensemanager.service;

import com.cts.eventsphere.expensemanager.dto.request.BudgetRequestDto;
import com.cts.eventsphere.expensemanager.dto.response.BudgetResponseDto;

/**
 * Service interface for managing event budgets.
 *
 * <p>Defines the contract for budget operations within the Finance Service.
 * Implementations handle cross-service validation via Feign (Event Service).</p>
 *
 * @author 2480081
 * @version 1.0
 * @since 25-03-2026
 * @see com.cts.eventsphere.expensemanager.service.impl.BudgetServiceImpl
 */
public interface BudgetService {

    /**
     * Creates a new budget for the specified event.
     *
     * @param eventId the UUID of the event to create the budget for
     * @param request the budget details containing the planned amount
     * @return the created budget's response DTO
     * @throws com.cts.eventsphere.expensemanager.exception.EventServiceException
     *         if the Event Service is unreachable or the event does not exist
     * @throws com.cts.eventsphere.expensemanager.exception.BudgetAlreadyExistsException
     *         if a budget already exists for the given event
     */
    BudgetResponseDto createBudget(String eventId, BudgetRequestDto request);

    /**
     * Retrieves the budget for the specified event.
     *
     * @param eventId the UUID of the event whose budget is to be fetched
     * @return the budget response DTO
     * @throws com.cts.eventsphere.expensemanager.exception.BudgetNotFoundException
     *         if no budget exists for the given event
     */
    BudgetResponseDto getBudgetByEventId(String eventId);
}
