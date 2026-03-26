package com.cts.ticketmanager.controllers;

import com.cts.eventsphere.dto.shared.GenericResponse;
import com.cts.eventsphere.dto.ticket.CreateTicketRequest;
import com.cts.eventsphere.dto.ticket.TicketListResponseDTO;
import com.cts.eventsphere.security.UserPrincipal;
import com.cts.eventsphere.service.TicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * Controller for ticket creation and updation.
 * Handles HTTP requests for ticket management and provides actor details for auditing.
 *
 * @author test-in-prod-10x
 * @version 1.0
 * @since 2026-03-08
 */
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Slf4j
public class TicketController {
    private final TicketService ticketService;

    /**
     * Creates a new ticket for a specific event.
     *
     * @param request     The request body containing ticket details (type, price, status).
     * @param eventId     The unique identifier of the event to create the ticket for.
     * @param userDetails The currently authenticated user's details representing the actor.
     * @return A {@link ResponseEntity} containing a {@link GenericResponse} indicating the result of the creation.
     */
    @PostMapping("/events/{eventId}/tickets")
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<GenericResponse> createTicket(
            @RequestBody @Valid CreateTicketRequest request,
            @PathVariable String eventId,
            @AuthenticationPrincipal UserPrincipal userDetails) {
        var actorId = userDetails.userId();
        log.info("Creating ticket for eventId: {}, actorId: {}, request: {}", eventId, actorId, request);
        return ResponseEntity.ok(ticketService.createTicket(actorId, eventId, request.type(), request.price(), request.status()));
    }

    /**
     * Retrieves a paginated list of tickets associated with a specific event.
     *
     * @param eventId     The unique identifier of the event.
     * @param userDetails The currently authenticated user's details representing the actor.
     * @param page        The page number to retrieve (defaults to 0).
     * @param size        The number of records per page (defaults to 10).
     * @return A {@link ResponseEntity} containing a {@link TicketListResponseDTO} with the paginated tickets.
     */
    @GetMapping("/events/{eventId}/tickets")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<TicketListResponseDTO> getTicketsByEventId(
            @PathVariable String eventId,
            @AuthenticationPrincipal UserPrincipal userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        var actorId = userDetails.userId();
        log.info("Fetching tickets for eventId: {}, actorId: {}, page: {}, size: {}", eventId, actorId, page, size);
        return ResponseEntity.ok(ticketService.getTicketsByEventId(actorId, eventId, page, size));
    }

    /**
     * Updates an existing ticket's details.
     *
     * @param ticketId    The unique identifier of the ticket to update.
     * @param userDetails The currently authenticated user's details representing the actor.
     * @param request     The request body containing the updated ticket details.
     * @return A {@link ResponseEntity} containing a {@link GenericResponse} indicating the result of the update.
     */
    @PutMapping("/tickets/{ticketId}")
    @PreAuthorize("hasAnyRole('ORGANIZER', 'ADMIN')")
    public ResponseEntity<GenericResponse> updateTicket(
            @PathVariable String ticketId,
            @AuthenticationPrincipal UserPrincipal userDetails,
            @RequestBody @Valid CreateTicketRequest request) {
        var actorId = userDetails.userId();
        log.info("Updating ticket with ticketId: {}, actorId: {}, request: {}", ticketId, actorId, request);
        return ResponseEntity.ok(ticketService.updateTicket(actorId, ticketId, request.type(), request.price(), request.status()));
    }

    /**
     * Deletes a specific ticket from the system.
     *
     * @param ticketId    The unique identifier of the ticket to delete.
     * @param userDetails The currently authenticated user's details representing the actor.
     * @return A {@link ResponseEntity} containing a {@link GenericResponse} indicating the result of the deletion.
     */
    @DeleteMapping("/tickets/{ticketId}")
    @PreAuthorize("hasAnyRole('ORGANIZER', 'ADMIN')")
    public ResponseEntity<GenericResponse> deleteTicket(
            @PathVariable String ticketId,
            @AuthenticationPrincipal UserPrincipal userDetails) {
        var actorId = userDetails.userId();
        log.info("Deleting ticket with ticketId: {}, actorId: {}", ticketId, actorId);
        return ResponseEntity.ok(ticketService.deleteTicket(actorId, ticketId));
    }
}