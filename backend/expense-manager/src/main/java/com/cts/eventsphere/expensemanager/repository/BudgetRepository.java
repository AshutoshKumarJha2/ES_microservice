package com.cts.eventsphere.expensemanager.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.cts.eventsphere.expensemanager.entity.Budget;

/**
 * Repository interface for managing {@link Budget} entities.
 *
 * <p>Extends {@link JpaRepository} to provide standard CRUD operations
 * and a custom query method for budget data access. The primary key
 * type is {@link String}, representing a UUID-based budget ID.</p>
 *
 * <p>Each event in EventSphere is associated with at most one {@link Budget}.
 * This repository is consumed by the service layer (via {@code BudgetService}
 * and {@code BudgetServiceImpl}) to enforce budget constraints during
 * expense creation and approval workflows.</p>
 *
 * @author 2480081
 * @version 1.0
 * @since 25-03-2026
 * @see com.cts.eventsphere.expensemanager.entity.Budget
 */
public interface BudgetRepository extends JpaRepository<Budget, String> {

    /**
     * Retrieves the budget associated with a specific event, if one exists.
     *
     * <p>Since each event has at most one budget, this method returns an
     * {@link Optional} rather than a list. The service layer should handle
     * the empty case gracefully — for example, throwing a custom
     * {@code BudgetNotFoundException} when no budget is found for the given event.</p>
     *
     * <p>Example usage in {@code BudgetServiceImpl}:</p>
     * <pre>
     *   Budget budget = budgetRepository.findByEventId(eventId)
     *       .orElseThrow(() -&gt; new BudgetNotFoundException(
     *           "No budget found for event: " + eventId));
     * </pre>
     *
     * @param eventId the unique identifier of the event whose budget is to be fetched;
     *                must not be {@code null} or empty
     * @return an {@link Optional} containing the {@link Budget} if found,
     *         or {@link Optional#empty()} if no budget exists for the given event
     */
    Optional<Budget> findByEventId(String eventId);

}