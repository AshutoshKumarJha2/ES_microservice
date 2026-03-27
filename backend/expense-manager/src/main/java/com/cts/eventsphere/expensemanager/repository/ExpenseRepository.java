package com.cts.eventsphere.expensemanager.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import com.cts.eventsphere.expensemanager.entity.Expense;

/**
 * Repository interface for managing {@link Expense} entities.
 *
 * <p>Extends {@link JpaRepository} to provide standard CRUD operations
 * and custom query methods for expense data access. The primary key
 * type is {@link String}, representing a UUID-based expense ID.</p>
 *
 * <p>This repository is used by the service layer (via
 * {@code ExpenseService} and {@code ExpenseServiceImpl}) to interact
 * with the underlying MySQL database.</p>
 *
 * @author 2480081
 * @version 1.0
 * @since 25-03-2026
 * @see com.cts.eventsphere.expensemanager.entity.Expense
 */
public interface ExpenseRepository extends JpaRepository<Expense , String>{
	
	/**
     * Retrieves a paginated list of expenses associated with a specific event.
     *
     * <p>Instead of loading all expenses for an event at once, this method
     * returns a {@link Page} slice controlled by the {@link Pageable} parameter,
     * allowing the service layer to request specific page numbers and sizes.</p>
     *
     * <p>Example usage in {@code ExpenseServiceImpl}:</p>
     * <pre>
     *   Pageable pageable = PageRequest.of(0, 10, Sort.by("createdAt").descending());
     *   Page&lt;Expense&gt; expenses = expenseRepository.findByEventId(eventId, pageable);
     * </pre>
     *
     * @param eventId  the unique identifier of the event whose expenses are to be fetched;
     *                 must not be {@code null} or empty
     * @param pageable the pagination and sorting information; use {@link org.springframework.data.domain.PageRequest}
     *                 to construct this
     * @return a {@link Page} of {@link Expense} objects belonging to the given event;
     *         returns an empty page if no expenses are found
     */
	Page<Expense> findByEventId(String eventId , Pageable pageable); // --> Without pagination, calling `findByEventId` would load **every single expense record** for that event into memory in one shot.

}
