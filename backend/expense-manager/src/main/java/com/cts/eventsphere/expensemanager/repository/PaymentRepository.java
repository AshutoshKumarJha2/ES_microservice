package com.cts.eventsphere.expensemanager.repository;

import com.cts.eventsphere.expensemanager.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * Repository interface for managing {@link Payment} entities.
 *
 * @author 2480081
 * @version 1.0
 * @since 26-03-2026
 */
public interface PaymentRepository extends JpaRepository<Payment, String> {

    /**
     * Finds all payments linked to a specific expense.
     *
     * @param expenseId the UUID of the expense
     * @return list of payments for that expense
     */
    List<Payment> findByExpense_ExpenseId(String expenseId);
}