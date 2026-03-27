package com.cts.eventsphere.expensemanager.exception;

import com.cts.eventsphere.expensemanager.entity.data.ExpenseStatus;

/**
 * Thrown when an expense status transition is not allowed.
 * For example, attempting to pay an expense that is not yet APPROVED.
 *
 * @author 2480081
 * @version 1.0
 * @since 25-03-2026
 */
public class InvalidExpenseStateException extends RuntimeException {

    public InvalidExpenseStateException(String expenseId, ExpenseStatus current, ExpenseStatus target) {
        super("Cannot transition expense " + expenseId
                + " from " + current + " to " + target);
    }
}