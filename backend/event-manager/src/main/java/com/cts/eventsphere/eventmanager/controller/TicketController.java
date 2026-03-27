package com.cts.eventsphere.eventmanager.controller;

import com.cts.eventsphere.eventmanager.dto.shared.GenericResponse;
import com.cts.eventsphere.eventmanager.dto.ticket.CreateTicketRequest;
import com.cts.eventsphere.eventmanager.dto.ticket.TicketListResponseDto;
import com.cts.eventsphere.eventmanager.dto.ticket.TicketResponseDto;
import com.cts.eventsphere.eventmanager.auth.dto.UserPrincipal;
import com.cts.eventsphere.eventmanager.service.TicketService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for ticket management.
 * Handles creation, retrieval, update, and deletion of tickets for events.
 *
 * @author test-in-prod-10x
 * @version 1.0
 * @since 2026-03-26
 */
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Slf4j
@Validated
public class TicketController {

    private final TicketService ticketService;

    @PostMapping("/events/{eventId}/tickets")
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<GenericResponse> createTicket(
            @RequestBody @Valid CreateTicketRequest request,
            @PathVariable String eventId,
            @AuthenticationPrincipal UserPrincipal userDetails) {
        var actorId = userDetails.userId();
        log.info("Creating ticket for eventId: {}, actorId: {}", eventId, actorId);
        return ResponseEntity.ok(ticketService.createTicket(actorId, eventId, request.type(), request.price(), request.status()));
    }

    @GetMapping("/events/{eventId}/tickets")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<TicketListResponseDto> getTicketsByEventId(
            @PathVariable String eventId,
            @AuthenticationPrincipal UserPrincipal userDetails,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "10") @Min(1) @Max(100) int size) {
        var actorId = userDetails.userId();
        log.info("Fetching tickets for eventId: {}, actorId: {}, page: {}, size: {}", eventId, actorId, page, size);
        return ResponseEntity.ok(ticketService.getTicketsByEventId(actorId, eventId, page, size));
    }

    @GetMapping("/tickets/{ticketId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<TicketResponseDto> getTicketById(
            @PathVariable String ticketId,
            @AuthenticationPrincipal UserPrincipal userDetails) {
        var actorId = userDetails.userId();
        log.info("Fetching ticket with ticketId: {}, actorId: {}", ticketId, actorId);
        return ResponseEntity.ok(ticketService.getTicketById(actorId, ticketId));
    }

    @PutMapping("/tickets/{ticketId}")
    @PreAuthorize("hasAnyRole('ORGANIZER', 'ADMIN')")
    public ResponseEntity<GenericResponse> updateTicket(
            @PathVariable String ticketId,
            @AuthenticationPrincipal UserPrincipal userDetails,
            @RequestBody @Valid CreateTicketRequest request) {
        var actorId = userDetails.userId();
        log.info("Updating ticket with ticketId: {}, actorId: {}", ticketId, actorId);
        return ResponseEntity.ok(ticketService.updateTicket(actorId, ticketId, request.type(), request.price(), request.status()));
    }

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
