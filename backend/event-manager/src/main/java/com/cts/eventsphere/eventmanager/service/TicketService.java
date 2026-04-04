package com.cts.eventsphere.eventmanager.service;

import com.cts.eventsphere.eventmanager.dto.shared.GenericResponse;
import com.cts.eventsphere.eventmanager.dto.ticket.TicketListResponseDto;
import com.cts.eventsphere.eventmanager.dto.ticket.TicketResponseDto;
import com.cts.eventsphere.eventmanager.model.data.TicketStatus;

/**
 * Service interface for managing ticket-related operations.
 * Handles ticket lifecycle and ensures all actions are attributed via actorId for auditing.
 *
 * @author test-in-prod-10x
 * @version 1.0
 * @since 2026-03-26
 */
public interface TicketService {

    /**
     * Creates a new ticket for a specific event.
     *
     * @param actorId the ID of the user performing the action
     * @param eventId the ID of the event
     * @param type    the ticket category (e.g., "vip", "general")
     * @param price   the cost of the ticket
     * @param status  the initial availability status
     * @return a {@link GenericResponse} indicating the result
     */
     TicketResponseDto createTicket(String actorId, String eventId, String type, double price, TicketStatus status);

    /**
     * Retrieves a paginated list of tickets for a specific event.
     *
     * @param actorId the ID of the user requesting the data
     * @param eventId the ID of the event
     * @param page    the page number (zero-based)
     * @param size    the number of records per page
     * @return a {@link TicketListResponseDto} with tickets and pagination metadata
     */
    TicketListResponseDto getTicketsByEventId(String actorId, String eventId, int page, int size);

    /**
     * Retrieves a paginated list of all tickets across all events.
     *
     * @param actorId the ID of the user requesting the data
     * @param page    the page number (zero-based)
     * @param size    the number of records per page
     * @return a {@link TicketListResponseDto} with all tickets and pagination metadata
     */
    TicketListResponseDto getAllTickets(String actorId, int page, int size);

    /**
     * Fetches a single ticket by its unique identifier.
     *
     * @param actorId  the ID of the user requesting the data
     * @param ticketId the ID of the ticket
     * @return a {@link TicketResponseDto} containing the ticket details
     */
    TicketResponseDto getTicketById(String actorId, String ticketId);

    /**
     * Updates the details of an existing ticket.
     *
     * @param actorId  the ID of the user performing the update
     * @param ticketId the ID of the ticket to update
     * @param type     the updated ticket category
     * @param price    the updated price
     * @param status   the updated availability status
     * @return a {@link GenericResponse} indicating the result
     */
    TicketResponseDto updateTicket(String actorId, String ticketId, String type, double price, TicketStatus status);

    /**
     * Deletes a ticket from the system.
     *
     * @param actorId  the ID of the user performing the deletion
     * @param ticketId the ID of the ticket to delete
     * @return a {@link GenericResponse} indicating the result
     */
    GenericResponse deleteTicket(String actorId, String ticketId);
}
