package com.cts.eventsphere.expensemanager.exception;

/**
 * Thrown when no {@link com.cts.eventsphere.expensemanager.entity.Expense}
 * is found for the given expense ID.
 *
 * @author 2480081
 * @version 1.0
 * @since 25-03-2026
 */
public class ExpenseNotFoundException extends RuntimeException {

    public ExpenseNotFoundException(String expenseId) {
        super("Expense not found with ID: " + expenseId);
    }
}