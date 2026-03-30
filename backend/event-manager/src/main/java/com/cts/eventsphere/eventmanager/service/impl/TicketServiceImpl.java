package com.cts.eventsphere.eventmanager.service.impl;

import com.cts.eventsphere.eventmanager.dto.mapper.ticket.TicketDtoMapper;
import com.cts.eventsphere.eventmanager.dto.shared.GenericResponse;
import com.cts.eventsphere.eventmanager.dto.ticket.TicketListResponseDto;
import com.cts.eventsphere.eventmanager.dto.ticket.TicketResponseDto;
import com.cts.eventsphere.eventmanager.exception.event.EventNotFoundException;
import com.cts.eventsphere.eventmanager.exception.ticket.TicketAlreadyExistsException;
import com.cts.eventsphere.eventmanager.exception.ticket.TicketNotFoundException;
import com.cts.eventsphere.eventmanager.model.Ticket;
import com.cts.eventsphere.eventmanager.model.data.TicketStatus;
import com.cts.eventsphere.eventmanager.repository.EventRepository;
import com.cts.eventsphere.eventmanager.repository.TicketRepository;
import com.cts.eventsphere.eventmanager.service.TicketService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

/**
 * Implementation of {@link TicketService}.
 * Handles business logic for creating, retrieving, updating, and deleting tickets.
 *
 * @author test-in-prod-10x
 * @version 1.0
 * @since 2026-03-26
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TicketServiceImpl implements TicketService {

    private final TicketRepository ticketRepository;
    private final EventRepository eventRepository;

    @Override
    public GenericResponse createTicket(String actorId, String eventId, String type, double price, TicketStatus status) {
        var event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EventNotFoundException(eventId));

        var normalizedType = type.toLowerCase();
        var existingTicket = ticketRepository.findByEventEventIdAndType(eventId, normalizedType);
        if (existingTicket.isPresent()) {
            throw new TicketAlreadyExistsException(String.format("Ticket type %s already exists for event %s", normalizedType, eventId));
        }

        var ticket = Ticket.builder()
                .event(event)
                .type(normalizedType)
                .price(BigDecimal.valueOf(price))
                .status(status)
                .build();

        ticketRepository.save(ticket);
        log.info("Ticket created with id: {}, for eventId: {} by actor: {}", ticket.getTicketId(), eventId, actorId);

        return new GenericResponse("Ticket created successfully");
    }

    @Override
    public TicketListResponseDto getTicketsByEventId(String actorId, String eventId, int page, int size) {
        log.info("Fetching tickets for eventId: {}, page: {}, size: {} by actor: {}", eventId, page, size, actorId);
        var ticketsPage = ticketRepository.findByEventEventId(eventId, PageRequest.of(page, size));

        var tickets = ticketsPage.getContent().stream()
                .map(TicketDtoMapper::toDto)
                .toList();

        log.info("Fetched {} tickets for eventId: {}", tickets.size(), eventId);
        return new TicketListResponseDto(
                tickets,
                ticketsPage.getNumber(),
                tickets.size(),
                ticketsPage.getTotalElements(),
                ticketsPage.getTotalPages()
        );
    }

    @Override
    public TicketListResponseDto getAllTickets(String actorId, int page, int size) {
        log.info("Fetching all tickets, page: {}, size: {} by actor: {}", page, size, actorId);
        var ticketsPage = ticketRepository.findAll(PageRequest.of(page, size));

        var tickets = ticketsPage.getContent().stream()
                .map(TicketDtoMapper::toDto)
                .toList();

        log.info("Fetched {} tickets", tickets.size());
        return new TicketListResponseDto(
                tickets,
                ticketsPage.getNumber(),
                tickets.size(),
                ticketsPage.getTotalElements(),
                ticketsPage.getTotalPages()
        );
    }

    @Override
    public TicketResponseDto getTicketById(String actorId, String ticketId) {
        var ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new TicketNotFoundException(ticketId));
        log.info("Fetched ticket with id: {} by actor: {}", ticketId, actorId);
        return TicketDtoMapper.toDto(ticket);
    }

    @Override
    public GenericResponse updateTicket(String actorId, String ticketId, String type, double price, TicketStatus status) {
        var ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new TicketNotFoundException(ticketId));

        ticket.setType(type);
        ticket.setPrice(BigDecimal.valueOf(price));
        ticket.setStatus(status);
        ticketRepository.save(ticket);

        log.info("Updated ticket with id: {} by actor: {}", ticketId, actorId);
        return new GenericResponse("Ticket updated successfully");
    }

    @Override
    public GenericResponse deleteTicket(String actorId, String ticketId) {
        if (!ticketRepository.existsById(ticketId)) {
            throw new TicketNotFoundException(ticketId);
        }
        ticketRepository.deleteById(ticketId);
        log.info("Deleted ticket with id: {} by actor: {}", ticketId, actorId);
        return new GenericResponse("Ticket deleted successfully");
    }
}
