package com.cts.eventsphere.expensemanager.entity.data;

/**
 * Represents the lifecycle status of an expense in the EventSphere financial workflow.
 *
 * <p>An expense transitions through the following stages:</p>
 * <pre>
 *   SUBMITTED → APPROVED → PAID
 *             ↘ REJECTED
 * </pre>
 *
 * @author 2480081
 * @version 1.0
 * @since 25-03-2026
 */
public enum ExpenseStatus {
    SUBMITTED, REJECTED , APPROVED , PAID
}

