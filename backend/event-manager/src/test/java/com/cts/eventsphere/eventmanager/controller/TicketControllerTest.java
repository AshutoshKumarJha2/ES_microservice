package com.cts.eventsphere.eventmanager.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.cts.eventsphere.eventmanager.auth.dto.UserPrincipal;
import com.cts.eventsphere.eventmanager.dto.shared.GenericResponse;
import com.cts.eventsphere.eventmanager.dto.ticket.TicketListResponseDto;
import com.cts.eventsphere.eventmanager.dto.ticket.TicketResponseDto;
import com.cts.eventsphere.eventmanager.exception.GlobalExceptionHandler;
import com.cts.eventsphere.eventmanager.exception.event.EventNotFoundException;
import com.cts.eventsphere.eventmanager.exception.ticket.TicketAlreadyExistsException;
import com.cts.eventsphere.eventmanager.exception.ticket.TicketNotFoundException;
import com.cts.eventsphere.eventmanager.model.data.TicketStatus;
import com.cts.eventsphere.eventmanager.service.AuditService;
import com.cts.eventsphere.eventmanager.service.TicketService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.method.annotation.AuthenticationPrincipalArgumentResolver;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class TicketControllerTest {

    @Mock private TicketService ticketService;
    @Mock private AuditService auditService;

    @InjectMocks private TicketController ticketController;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    private static final String ACTOR_ID  = "actor-001";
    private static final String EVENT_ID  = "event-001";
    private static final String TICKET_ID = "ticket-001";

    private TicketResponseDto ticketResponse;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();

        mockMvc = MockMvcBuilders
                .standaloneSetup(ticketController)
                .setCustomArgumentResolvers(new AuthenticationPrincipalArgumentResolver())
                .setControllerAdvice(new GlobalExceptionHandler(auditService))
                .build();

        var principal = new UserPrincipal(ACTOR_ID, "ORGANIZER",
                List.of(new SimpleGrantedAuthority("ROLE_ORGANIZER")));
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(principal, null, principal.authorities()));

        ticketResponse = new TicketResponseDto(TICKET_ID, EVENT_ID, "general", 50.0, TicketStatus.ACTIVE);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    // -------------------------------------------------------------------------
    // POST /events/{eventId}/tickets
    // -------------------------------------------------------------------------
    @Nested
    @DisplayName("POST /events/{eventId}/tickets")
    class CreateTicket {

        private static final String VALID_BODY = """
                {"type": "general", "price": 50.0, "status": "ACTIVE"}
                """;

//        @Test
//        @DisplayName("happy path – returns 200 with success message")
//        void createTicket_happyPath() throws Exception {
//            when(ticketService.createTicket(ACTOR_ID, EVENT_ID, "general", 50.0, TicketStatus.ACTIVE))
//                    .thenReturn(new GenericResponse("Ticket created successfully"));
//
//            mockMvc.perform(post("/events/{eventId}/tickets", EVENT_ID)
//                            .contentType(MediaType.APPLICATION_JSON)
//                            .content(VALID_BODY))
//                    .andExpect(status().isOk())
//                    .andExpect(jsonPath("$.message").value("Ticket created successfully"));
//        }

        @Test
        @DisplayName("unhappy path – returns 404 when event does not exist")
        void createTicket_eventNotFound() throws Exception {
            when(ticketService.createTicket(ACTOR_ID, EVENT_ID, "general", 50.0, TicketStatus.ACTIVE))
                    .thenThrow(new EventNotFoundException(EVENT_ID));

            mockMvc.perform(post("/events/{eventId}/tickets", EVENT_ID)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(VALID_BODY))
                    .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("unhappy path – returns 409 when ticket type already exists for event")
        void createTicket_typeAlreadyExists() throws Exception {
            when(ticketService.createTicket(ACTOR_ID, EVENT_ID, "general", 50.0, TicketStatus.ACTIVE))
                    .thenThrow(new TicketAlreadyExistsException("Ticket type general already exists for event " + EVENT_ID));

            mockMvc.perform(post("/events/{eventId}/tickets", EVENT_ID)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(VALID_BODY))
                    .andExpect(status().isConflict());
        }

        @Test
        @DisplayName("unhappy path – returns 400 when request body is invalid (blank type)")
        void createTicket_blankType_returns400() throws Exception {
            mockMvc.perform(post("/events/{eventId}/tickets", EVENT_ID)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"type\": \"\", \"price\": 50.0, \"status\": \"ACTIVE\"}"))
                    .andExpect(status().isBadRequest());
        }
    }

    // -------------------------------------------------------------------------
    // GET /events/{eventId}/tickets
    // -------------------------------------------------------------------------
    @Nested
    @DisplayName("GET /events/{eventId}/tickets")
    class GetTicketsByEvent {

        @Test
        @DisplayName("happy path – returns 200 with paginated ticket list")
        void getTicketsByEventId_happyPath() throws Exception {
            var listResponse = new TicketListResponseDto(List.of(ticketResponse), 0, 1, 1L, 1);
            when(ticketService.getTicketsByEventId(ACTOR_ID, EVENT_ID, 0, 10)).thenReturn(listResponse);

            mockMvc.perform(get("/events/{eventId}/tickets", EVENT_ID)
                            .param("page", "0")
                            .param("size", "10"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.totalElements").value(1))
                    .andExpect(jsonPath("$.tickets[0].ticketId").value(TICKET_ID));
        }

        @Test
        @DisplayName("happy path – returns 200 with empty list when no tickets exist for event")
        void getTicketsByEventId_empty() throws Exception {
            var emptyResponse = new TicketListResponseDto(List.of(), 0, 0, 0L, 0);
            when(ticketService.getTicketsByEventId(ACTOR_ID, EVENT_ID, 0, 10)).thenReturn(emptyResponse);

            mockMvc.perform(get("/events/{eventId}/tickets", EVENT_ID)
                            .param("page", "0")
                            .param("size", "10"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.totalElements").value(0));
        }
    }

    // -------------------------------------------------------------------------
    // GET /tickets/{ticketId}
    // -------------------------------------------------------------------------
    @Nested
    @DisplayName("GET /tickets/{ticketId}")
    class GetTicketById {

        @Test
        @DisplayName("happy path – returns 200 with ticket body")
        void getTicketById_happyPath() throws Exception {
            when(ticketService.getTicketById(ACTOR_ID, TICKET_ID)).thenReturn(ticketResponse);

            mockMvc.perform(get("/tickets/{ticketId}", TICKET_ID))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.ticketId").value(TICKET_ID))
                    .andExpect(jsonPath("$.type").value("general"))
                    .andExpect(jsonPath("$.price").value(50.0));
        }

        @Test
        @DisplayName("unhappy path – returns 404 when ticket does not exist")
        void getTicketById_notFound() throws Exception {
            when(ticketService.getTicketById(ACTOR_ID, TICKET_ID))
                    .thenThrow(new TicketNotFoundException(TICKET_ID));

            mockMvc.perform(get("/tickets/{ticketId}", TICKET_ID))
                    .andExpect(status().isNotFound());
        }
    }

    // -------------------------------------------------------------------------
    // PUT /tickets/{ticketId}
    // -------------------------------------------------------------------------
    @Nested
    @DisplayName("PUT /tickets/{ticketId}")
    class UpdateTicket {

        private static final String VALID_BODY = """
                {"type": "vip", "price": 150.0, "status": "ACTIVE"}
                """;

//        @Test
//        @DisplayName("happy path – returns 200 with update message")
//        void updateTicket_happyPath() throws Exception {
//            when(ticketService.updateTicket(ACTOR_ID, TICKET_ID, "vip", 150.0, TicketStatus.ACTIVE))
//                    .thenReturn(new GenericResponse("Ticket updated successfully"));
//
//            mockMvc.perform(put("/tickets/{ticketId}", TICKET_ID)
//                            .contentType(MediaType.APPLICATION_JSON)
//                            .content(VALID_BODY))
//                    .andExpect(status().isOk())
//                    .andExpect(jsonPath("$.message").value("Ticket updated successfully"));
//        }

        @Test
        @DisplayName("unhappy path – returns 404 when ticket does not exist")
        void updateTicket_notFound() throws Exception {
            when(ticketService.updateTicket(ACTOR_ID, TICKET_ID, "vip", 150.0, TicketStatus.ACTIVE))
                    .thenThrow(new TicketNotFoundException(TICKET_ID));

            mockMvc.perform(put("/tickets/{ticketId}", TICKET_ID)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(VALID_BODY))
                    .andExpect(status().isNotFound());
        }
    }

    // -------------------------------------------------------------------------
    // DELETE /tickets/{ticketId}
    // -------------------------------------------------------------------------
    @Nested
    @DisplayName("DELETE /tickets/{ticketId}")
    class DeleteTicket {

        @Test
        @DisplayName("happy path – returns 200 with deletion message")
        void deleteTicket_happyPath() throws Exception {
            when(ticketService.deleteTicket(ACTOR_ID, TICKET_ID))
                    .thenReturn(new GenericResponse("Ticket deleted successfully"));

            mockMvc.perform(delete("/tickets/{ticketId}", TICKET_ID))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.message").value("Ticket deleted successfully"));
        }

        @Test
        @DisplayName("unhappy path – returns 404 when ticket does not exist")
        void deleteTicket_notFound() throws Exception {
            when(ticketService.deleteTicket(ACTOR_ID, TICKET_ID))
                    .thenThrow(new TicketNotFoundException(TICKET_ID));

            mockMvc.perform(delete("/tickets/{ticketId}", TICKET_ID))
                    .andExpect(status().isNotFound());
        }
    }
}
