package com.cts.ticketmanager.service;


import com.cts.ticketmanager.dto.shared.GenericResponse;
import com.cts.ticketmanager.dto.ticket.TicketListResponseDTO;
import com.cts.ticketmanager.dto.ticket.TicketResponseDTO;
import com.cts.ticketmanager.models.data.TicketStatus;

/**
 * Service interface for managing ticket-related operations.
 * Handles ticket lifecycle and ensures all actions are attributed via actorId for auditing.
 *
 * @author test-in-prod-10x
 * @version 1.0
 * @since 2026-03-08
 */
public interface TicketService {

    /**
     * Creates a new ticket entry for a specific event.
     *
     * @param actorId The unique identifier of the user performing the creation.
     * @param eventId The unique identifier of the event.
     * @param type    The category of the ticket (e.g., General, VIP).
     * @param price   The cost associated with the ticket.
     * @param status  The initial status of the ticket (e.g., available, sold_out).
     * @return A {@link GenericResponse} containing the operation status message.
     */
    GenericResponse createTicket(String actorId, String eventId, String type, double price, TicketStatus status);

    /**
     * Retrieves a paginated list of tickets for a specific event.
     *
     * @param actorId The unique identifier of the user requesting the data.
     * @param eventId The unique identifier of the event.
     * @param page    The page number to retrieve.
     * @param size    The number of records per page.
     * @return A {@link TicketListResponseDTO} containing the list of tickets and pagination details.
     */
    TicketListResponseDTO getTicketsByEventId(String actorId, String eventId, int page, int size);

    /**
     * Retrieves a paginated list of all tickets across all events.
     *
     * @param actorId The unique identifier of the user requesting the data.
     * @param page    The page number to retrieve.
     * @param size    The number of records per page.
     * @return A {@link TicketListResponseDTO} containing the full list of tickets.
     */
    TicketListResponseDTO getAllTickets(String actorId, int page, int size);

    /**
     * Fetches details for a specific ticket by its unique identifier.
     *
     * @param actorId  The unique identifier of the user requesting the data.
     * @param ticketId The unique identifier of the ticket.
     * @return A {@link TicketResponseDTO} containing the ticket details.
     */
    TicketResponseDTO getTicketById(String actorId, String ticketId);

    /**
     * Updates the details of an existing ticket.
     *
     * @param actorId  The unique identifier of the user performing the update.
     * @param ticketId The unique identifier of the ticket to be updated.
     * @param type     The updated category of the ticket.
     * @param price    The updated cost.
     * @param status   The updated status.
     * @return A {@link GenericResponse} containing the operation status message.
     */
    GenericResponse updateTicket(String actorId, String ticketId, String type, double price, TicketStatus status);

    /**
     * Deletes a ticket from the system.
     *
     * @param actorId  The unique identifier of the user performing the deletion.
     * @param ticketId The unique identifier of the ticket to be removed.
     * @return A {@link GenericResponse} containing the operation status message.
     */
    GenericResponse deleteTicket(String actorId, String ticketId);
}