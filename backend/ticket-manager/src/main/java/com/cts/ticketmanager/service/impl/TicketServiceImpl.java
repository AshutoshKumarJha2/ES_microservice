package com.cts.ticketmanager.service.impl;

import com.cts.eventsphere.dto.mapper.ticket.TicketDTOMapper;
import com.cts.eventsphere.dto.shared.GenericResponse;
import com.cts.eventsphere.dto.ticket.TicketListResponseDTO;
import com.cts.eventsphere.dto.ticket.TicketResponseDTO;
import com.cts.eventsphere.exception.ticket.TicketAlreadyExistsException;
import com.cts.eventsphere.exception.ticket.TicketNotFoundException;
import com.cts.eventsphere.model.Ticket;
import com.cts.eventsphere.model.data.AuditAction;
import com.cts.eventsphere.model.data.TicketStatus;
import com.cts.eventsphere.repository.TicketRepository;
import com.cts.eventsphere.service.AuditService;
import com.cts.eventsphere.service.TicketService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

/**
 * Service implementation for managing tickets.
 * Handles business logic for creating, retrieving, updating, and deleting tickets.
 *
 * @author test-in-prod-10x
 * @version 1.0
 * @since 2026-03-08
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TicketServiceImpl implements TicketService {
    private final TicketRepository ticketRepository;
    private final AuditService auditService;

    /**
     * Creates a new ticket for a specific event.
     *
     * @param actorId The unique identifier of the user performing the creation.
     * @param eventId The ID of the event the ticket belongs to.
     * @param type    The category of the ticket (e.g., VIP, General). Case-insensitive.
     * @param price   The cost of the ticket.
     * @param status  The initial availability status of the ticket.
     * @return A {@link GenericResponse} indicating success.
     * @throws TicketAlreadyExistsException if a ticket with the same type already exists.
     */
    @Override
    public GenericResponse createTicket(String actorId, String eventId, String type, double price, TicketStatus status) throws TicketAlreadyExistsException {
        var normalizedType = type.toLowerCase();
        var existingTicket = ticketRepository.findByEventIdAndType(eventId, normalizedType);
        if (existingTicket.isPresent()){
            throw new TicketAlreadyExistsException(String.format("Ticket type %s already exists", normalizedType));
        }
        var ticket = Ticket.builder()
                .eventId(eventId)
                .type(normalizedType)
                .price(BigDecimal.valueOf(price))
                .status(status)
                .build();

        ticketRepository.save(ticket);
        log.info("Ticket created with id: {}, for eventId: {} by actor: {}", ticket.getTicketId(), eventId, actorId);

        auditService.logAudit(actorId, AuditAction.CREATE, Ticket.class, ticket.getTicketId());

        return new GenericResponse("Ticket created successfully");
    }


    /**
     * Retrieves a paginated list of tickets for a specific event.
     *
     * @param actorId The unique identifier of the user requesting the data.
     * @param eventId The ID of the event.
     * @param page    The page index (zero-based).
     * @param size    The number of items per page.
     * @return A {@link TicketListResponseDTO} containing ticket data and pagination metadata.
     */
    @Override
    public TicketListResponseDTO getTicketsByEventId(String actorId, String eventId, int page, int size) {
        log.info("Fetching tickets for eventId: {}, page: {}, size: {} by actor: {}", eventId, page, size, actorId);
        var ticketsPage = ticketRepository.findByEventId(eventId, PageRequest.of(page, size));

        var tickets = ticketsPage.getContent().stream()
                .peek(ticket -> auditService.logAudit(actorId, AuditAction.READ, Ticket.class, ticket.getTicketId()))
                .map(TicketDTOMapper::toDTO)
                .toList();

        log.info("Fetched {} tickets for eventId: {}, page: {}, size: {}", tickets.size(), eventId, page, size);
        return new TicketListResponseDTO(
                tickets,
                ticketsPage.getNumber(),
                tickets.size(),
                ticketsPage.getTotalElements(),
                ticketsPage.getTotalPages()
        );
    }

    /**
     * Retrieves a paginated list of all tickets across all events.
     *
     * @param actorId The unique identifier of the user requesting the data.
     * @param page    The page index (zero-based).
     * @param size    The number of items per page.
     * @return A {@link TicketListResponseDTO} containing all ticket records.
     */
    @Override
    public TicketListResponseDTO getAllTickets(String actorId, int page, int size) {
        log.info("Fetching all tickets, page: {}, size: {} by actor: {}", page, size, actorId);
        var ticketsPage = ticketRepository.findAll(PageRequest.of(page, size));

        var tickets = ticketsPage.getContent().stream()
                .peek(ticket -> auditService.logAudit(actorId, AuditAction.READ, Ticket.class, ticket.getTicketId()))
                .map(TicketDTOMapper::toDTO)
                .toList();

        log.info("Fetched {} tickets, page: {}, size: {}", tickets.size(), page, size);
        return new TicketListResponseDTO(
                tickets,
                ticketsPage.getNumber(),
                tickets.size(),
                ticketsPage.getTotalElements(),
                ticketsPage.getTotalPages()
        );
    }

    /**
     * Finds a single ticket by its unique identifier.
     *
     * @param actorId  The unique identifier of the user requesting the data.
     * @param ticketId The unique ID of the ticket.
     * @return The {@link TicketResponseDTO} representing the ticket details.
     * @throws TicketNotFoundException if no ticket is found with the given ID.
     */
    @Override
    public TicketResponseDTO getTicketById(String actorId, String ticketId) {
        var ticket = ticketRepository.findById(ticketId).orElseThrow(() -> new TicketNotFoundException("Ticket not found"));

        auditService.logAudit(actorId, AuditAction.READ, Ticket.class, ticketId);
        log.info("Fetched ticket with id: {} by actor: {}", ticketId, actorId);

        return TicketDTOMapper.toDTO(ticket);
    }

    /**
     * Updates the details of an existing ticket.
     *
     * @param actorId  The unique identifier of the user performing the update.
     * @param ticketId The ID of the ticket to update.
     * @param type     The new type/category for the ticket.
     * @param price    The updated price.
     * @param status   The updated availability status.
     * @return A {@link GenericResponse} indicating successful update.
     * @throws TicketNotFoundException if the ticket ID does not exist.
     */
    @Override
    public GenericResponse updateTicket(String actorId, String ticketId, String type, double price, TicketStatus status) {
        var ticket = ticketRepository.findById(ticketId).orElseThrow(() -> new TicketNotFoundException("Ticket not found"));

        ticket.setType(type);
        ticket.setPrice(BigDecimal.valueOf(price));
        ticket.setStatus(status);
        ticketRepository.save(ticket);

        auditService.logAudit(actorId, AuditAction.UPDATE, Ticket.class, ticketId);
        log.info("Updated ticket with id: {} by actor: {}", ticketId, actorId);

        return new GenericResponse("Ticket updated successfully");
    }

    /**
     * Deletes a ticket record from the database.
     *
     * @param actorId  The unique identifier of the user performing the deletion.
     * @param ticketId The unique ID of the ticket to delete.
     * @return A {@link GenericResponse} indicating successful deletion.
     * @throws TicketNotFoundException if the ticket ID does not exist.
     */
    @Override
    public GenericResponse deleteTicket(String actorId, String ticketId) {
        if (!ticketRepository.existsById(ticketId)) {
            throw new TicketNotFoundException("Ticket not found");
        }
        ticketRepository.deleteById(ticketId);

        auditService.logAudit(actorId, AuditAction.DELETE, Ticket.class, ticketId);
        log.info("Deleted ticket with id: {} by actor: {}", ticketId, actorId);

        return new GenericResponse("Ticket deleted successfully");
    }
}