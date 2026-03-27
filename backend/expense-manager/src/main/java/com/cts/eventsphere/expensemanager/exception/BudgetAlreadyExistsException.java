package com.cts.eventsphere.expensemanager.exception;

/**
 * Thrown when attempting to create a second budget for an event
 * that already has one. Each event may have at most one budget.
 *
 * @author 2480081
 * @version 1.0
 * @since 25-03-2026
 */
public class BudgetAlreadyExistsException extends RuntimeException {

    public BudgetAlreadyExistsException(String eventId) {
        super("Budget already exists for event: " + eventId);
    }
}