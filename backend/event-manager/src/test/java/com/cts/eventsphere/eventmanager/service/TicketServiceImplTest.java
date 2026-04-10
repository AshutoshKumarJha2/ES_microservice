package com.cts.eventsphere.eventmanager.service;

import com.cts.eventsphere.eventmanager.dto.shared.GenericResponse;
import com.cts.eventsphere.eventmanager.dto.ticket.TicketListResponseDto;
import com.cts.eventsphere.eventmanager.dto.ticket.TicketResponseDto;
import com.cts.eventsphere.eventmanager.exception.event.EventNotFoundException;
import com.cts.eventsphere.eventmanager.exception.ticket.TicketAlreadyExistsException;
import com.cts.eventsphere.eventmanager.exception.ticket.TicketNotFoundException;
import com.cts.eventsphere.eventmanager.model.Event;
import com.cts.eventsphere.eventmanager.model.Ticket;
import com.cts.eventsphere.eventmanager.model.data.EventStatus;
import com.cts.eventsphere.eventmanager.model.data.TicketStatus;
import com.cts.eventsphere.eventmanager.repository.EventRepository;
import com.cts.eventsphere.eventmanager.repository.TicketRepository;
import com.cts.eventsphere.eventmanager.service.impl.TicketServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TicketServiceImplTest {

    @Mock private TicketRepository ticketRepository;
    @Mock private EventRepository eventRepository;

    @InjectMocks
    private TicketServiceImpl ticketService;

    private static final String ACTOR_ID  = "actor-001";
    private static final String EVENT_ID  = "event-001";
    private static final String TICKET_ID = "ticket-001";

    private Event sampleEvent;
    private Ticket sampleTicket;

    @BeforeEach
    void setUp() {
        sampleEvent = Event.builder()
                .eventId(EVENT_ID)
                .name("Test Event")
                .organizerId("org-001")
                .startDate(LocalDate.now().plusDays(1))
                .endDate(LocalDate.now().plusDays(5))
                .status(EventStatus.PUBLISHED)
                .build();

        sampleTicket = Ticket.builder()
                .ticketId(TICKET_ID)
                .event(sampleEvent)
                .type("general")
                .price(BigDecimal.valueOf(50.0))
                .status(TicketStatus.ACTIVE)
                .build();
    }

    // -------------------------------------------------------------------------
    // createTicket
    // -------------------------------------------------------------------------
    @Nested
    @DisplayName("createTicket()")
    class CreateTicket {

        @Test
        @DisplayName("happy path – saves ticket and returns success message")
        void createTicket_happyPath() {
            when(eventRepository.findById(EVENT_ID)).thenReturn(Optional.of(sampleEvent));
            when(ticketRepository.findByEventEventIdAndType(EVENT_ID, "general")).thenReturn(Optional.empty());
            when(ticketRepository.save(any(Ticket.class))).thenReturn(sampleTicket);

            TicketResponseDto result = ticketService.createTicket(ACTOR_ID, EVENT_ID, "general", 50.0, TicketStatus.ACTIVE);

            assertThat(result.status()).isEqualTo(TicketStatus.ACTIVE);
            verify(ticketRepository).save(any(Ticket.class));
        }

        @Test
        @DisplayName("happy path – type is normalised to lowercase before duplicate check")
        void createTicket_typeNormalisedToLowercase() {
            when(eventRepository.findById(EVENT_ID)).thenReturn(Optional.of(sampleEvent));
            when(ticketRepository.findByEventEventIdAndType(EVENT_ID, "vip")).thenReturn(Optional.empty());
            when(ticketRepository.save(any(Ticket.class))).thenReturn(sampleTicket);

            ticketService.createTicket(ACTOR_ID, EVENT_ID, "VIP", 200.0, TicketStatus.ACTIVE);

            verify(ticketRepository).findByEventEventIdAndType(EVENT_ID, "vip");
        }

        @Test
        @DisplayName("unhappy path – throws EventNotFoundException when event does not exist")
        void createTicket_eventNotFound() {
            when(eventRepository.findById(EVENT_ID)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> ticketService.createTicket(ACTOR_ID, EVENT_ID, "general", 50.0, TicketStatus.ACTIVE))
                    .isInstanceOf(EventNotFoundException.class)
                    .hasMessageContaining(EVENT_ID);

            verify(ticketRepository, never()).save(any());
        }

        @Test
        @DisplayName("unhappy path – throws TicketAlreadyExistsException when type already exists for event")
        void createTicket_typeAlreadyExists() {
            when(eventRepository.findById(EVENT_ID)).thenReturn(Optional.of(sampleEvent));
            when(ticketRepository.findByEventEventIdAndType(EVENT_ID, "general")).thenReturn(Optional.of(sampleTicket));

            assertThatThrownBy(() -> ticketService.createTicket(ACTOR_ID, EVENT_ID, "general", 50.0, TicketStatus.ACTIVE))
                    .isInstanceOf(TicketAlreadyExistsException.class)
                    .hasMessageContaining("general")
                    .hasMessageContaining(EVENT_ID);

            verify(ticketRepository, never()).save(any());
        }
    }

    // -------------------------------------------------------------------------
    // getTicketsByEventId
    // -------------------------------------------------------------------------
    @Nested
    @DisplayName("getTicketsByEventId()")
    class GetTicketsByEventId {

        @Test
        @DisplayName("happy path – returns paginated tickets for the given event")
        void getTicketsByEventId_happyPath() {
            var ticketPage = new PageImpl<>(List.of(sampleTicket), PageRequest.of(0, 10), 1);
            when(ticketRepository.findByEventEventId(eq(EVENT_ID), any())).thenReturn(ticketPage);

            TicketListResponseDto result = ticketService.getTicketsByEventId(ACTOR_ID, EVENT_ID, 0, 10);

            assertThat(result.tickets()).hasSize(1);
            assertThat(result.tickets().get(0).ticketId()).isEqualTo(TICKET_ID);
            assertThat(result.totalElements()).isEqualTo(1);
        }

        @Test
        @DisplayName("happy path – returns empty list when no tickets exist for event")
        void getTicketsByEventId_empty() {
            var emptyPage = new PageImpl<Ticket>(List.of(), PageRequest.of(0, 10), 0);
            when(ticketRepository.findByEventEventId(eq(EVENT_ID), any())).thenReturn(emptyPage);

            TicketListResponseDto result = ticketService.getTicketsByEventId(ACTOR_ID, EVENT_ID, 0, 10);

            assertThat(result.tickets()).isEmpty();
            assertThat(result.totalElements()).isZero();
        }
    }

    // -------------------------------------------------------------------------
    // getAllTickets
    // -------------------------------------------------------------------------
    @Nested
    @DisplayName("getAllTickets()")
    class GetAllTickets {

        @Test
        @DisplayName("happy path – returns paginated list of all tickets")
        void getAllTickets_happyPath() {
            var ticketPage = new PageImpl<>(List.of(sampleTicket), PageRequest.of(0, 10), 1);
            when(ticketRepository.findAll(any(PageRequest.class))).thenReturn(ticketPage);

            TicketListResponseDto result = ticketService.getAllTickets(ACTOR_ID, 0, 10);

            assertThat(result.tickets()).hasSize(1);
            assertThat(result.totalElements()).isEqualTo(1);
        }
    }

    // -------------------------------------------------------------------------
    // getTicketById
    // -------------------------------------------------------------------------
    @Nested
    @DisplayName("getTicketById()")
    class GetTicketById {

        @Test
        @DisplayName("happy path – returns mapped TicketResponseDto")
        void getTicketById_happyPath() {
            when(ticketRepository.findById(TICKET_ID)).thenReturn(Optional.of(sampleTicket));

            TicketResponseDto result = ticketService.getTicketById(ACTOR_ID, TICKET_ID);

            assertThat(result.ticketId()).isEqualTo(TICKET_ID);
            assertThat(result.eventId()).isEqualTo(EVENT_ID);
            assertThat(result.type()).isEqualTo("general");
            assertThat(result.price()).isEqualTo(50.0);
            assertThat(result.status()).isEqualTo(TicketStatus.ACTIVE);
        }

        @Test
        @DisplayName("unhappy path – throws TicketNotFoundException when ticket does not exist")
        void getTicketById_notFound() {
            when(ticketRepository.findById(TICKET_ID)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> ticketService.getTicketById(ACTOR_ID, TICKET_ID))
                    .isInstanceOf(TicketNotFoundException.class)
                    .hasMessageContaining(TICKET_ID);
        }
    }

    // -------------------------------------------------------------------------
    // updateTicket
    // -------------------------------------------------------------------------
    @Nested
    @DisplayName("updateTicket()")
    class UpdateTicket {

        @Test
        @DisplayName("happy path – updates ticket fields and returns success message")
        void updateTicket_happyPath() {
            when(ticketRepository.findById(TICKET_ID)).thenReturn(Optional.of(sampleTicket));
            when(ticketRepository.save(sampleTicket)).thenReturn(sampleTicket);

            TicketResponseDto result = ticketService.updateTicket(ACTOR_ID, TICKET_ID, "vip", 150.0, TicketStatus.INACTIVE);

            assertThat(result.status()).isEqualTo(TicketStatus.INACTIVE);
            assertThat(sampleTicket.getType()).isEqualTo("vip");
            assertThat(sampleTicket.getPrice()).isEqualByComparingTo(BigDecimal.valueOf(150.0));
            assertThat(sampleTicket.getStatus()).isEqualTo(TicketStatus.INACTIVE);
            verify(ticketRepository).save(sampleTicket);
        }

        @Test
        @DisplayName("unhappy path – throws TicketNotFoundException when ticket does not exist")
        void updateTicket_notFound() {
            when(ticketRepository.findById(TICKET_ID)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> ticketService.updateTicket(ACTOR_ID, TICKET_ID, "vip", 150.0, TicketStatus.ACTIVE))
                    .isInstanceOf(TicketNotFoundException.class)
                    .hasMessageContaining(TICKET_ID);

            verify(ticketRepository, never()).save(any());
        }
    }

    // -------------------------------------------------------------------------
    // deleteTicket
    // -------------------------------------------------------------------------
    @Nested
    @DisplayName("deleteTicket()")
    class DeleteTicket {

        @Test
        @DisplayName("happy path – deletes ticket and returns success message")
        void deleteTicket_happyPath() {
            when(ticketRepository.existsById(TICKET_ID)).thenReturn(true);

            GenericResponse result = ticketService.deleteTicket(ACTOR_ID, TICKET_ID);

            assertThat(result.message()).isEqualTo("Ticket deleted successfully");
            verify(ticketRepository).deleteById(TICKET_ID);
        }

        @Test
        @DisplayName("unhappy path – throws TicketNotFoundException when ticket does not exist")
        void deleteTicket_notFound() {
            when(ticketRepository.existsById(TICKET_ID)).thenReturn(false);

            assertThatThrownBy(() -> ticketService.deleteTicket(ACTOR_ID, TICKET_ID))
                    .isInstanceOf(TicketNotFoundException.class)
                    .hasMessageContaining(TICKET_ID);

            verify(ticketRepository, never()).deleteById(any());
        }
    }
}
