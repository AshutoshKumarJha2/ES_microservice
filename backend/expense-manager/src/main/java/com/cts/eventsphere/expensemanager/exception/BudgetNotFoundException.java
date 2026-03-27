package com.cts.eventsphere.expensemanager.exception;

/**
 * Thrown when no {@link com.cts.eventsphere.expensemanager.entity.Budget}
 * is found for the requested event.
 *
 * @author 2480081
 * @version 1.0
 * @since 25-03-2026
 */
public class BudgetNotFoundException extends RuntimeException {

    public BudgetNotFoundException(String eventId) {
        super("No budget found for event: " + eventId);
    }
}