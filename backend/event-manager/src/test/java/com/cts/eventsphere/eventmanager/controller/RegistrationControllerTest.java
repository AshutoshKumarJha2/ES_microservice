package com.cts.eventsphere.eventmanager.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.cts.eventsphere.eventmanager.auth.dto.UserPrincipal;
import com.cts.eventsphere.eventmanager.dto.registration.RegistrationDto;
import com.cts.eventsphere.eventmanager.dto.registration.RegistrationListResponseDto;
import com.cts.eventsphere.eventmanager.dto.shared.GenericResponse;
import com.cts.eventsphere.eventmanager.exception.GlobalExceptionHandler;
import com.cts.eventsphere.eventmanager.exception.event.EventNotFoundException;
import com.cts.eventsphere.eventmanager.exception.registration.DuplicateRegistrationException;
import com.cts.eventsphere.eventmanager.exception.registration.InvalidRegistrationStatusException;
import com.cts.eventsphere.eventmanager.exception.registration.RegistrationNotFoundException;
import com.cts.eventsphere.eventmanager.service.AuditService;
import com.cts.eventsphere.eventmanager.service.RegistrationService;
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

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class RegistrationControllerTest {

    @Mock private RegistrationService registrationService;
    @Mock private AuditService auditService;

    @InjectMocks private RegistrationController registrationController;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    private static final String USER_ID  = "user-001";
    private static final String EVENT_ID = "event-001";
    private static final String REG_ID   = "reg-001";
    private static final String TICKET_ID = "ticket-001";

    private RegistrationDto registrationDto;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();

        mockMvc = MockMvcBuilders
                .standaloneSetup(registrationController)
                .setCustomArgumentResolvers(new AuthenticationPrincipalArgumentResolver())
                .setControllerAdvice(new GlobalExceptionHandler(auditService))
                .build();

        var principal = new UserPrincipal(USER_ID, "ATTENDEE",
                List.of(new SimpleGrantedAuthority("ROLE_ATTENDEE")));
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(principal, null, principal.authorities()));

        registrationDto = RegistrationDto.builder()
                .registrationId(REG_ID)
                .eventId(EVENT_ID)
                .ticketId(TICKET_ID)
                .attendeeId(USER_ID)
                .status("PENDING")
                .build();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    // -------------------------------------------------------------------------
    // POST /events/{eventId}/registrations
    // -------------------------------------------------------------------------
    @Nested
    @DisplayName("POST /events/{eventId}/registrations")
    class CreateRegistration {

//        @Test
//        @DisplayName("happy path – returns 200 with success message")
//        void createRegistration_happyPath() throws Exception {
//            when(registrationService.registerForEvent(USER_ID, EVENT_ID, TICKET_ID))
//                    .thenReturn(new GenericResponse("Registration successful"));
//
//            mockMvc.perform(post("/events/{eventId}/registrations", EVENT_ID)
//                            .contentType(MediaType.APPLICATION_JSON)
//                            .content("{\"ticketId\": \"" + TICKET_ID + "\"}"))
//                    .andExpect(status().isOk())
//                    .andExpect(jsonPath("$.message").value("Registration successful"));
//        }

        @Test
        @DisplayName("unhappy path – returns 409 when user is already registered")
        void createRegistration_duplicate_returns409() throws Exception {
            when(registrationService.registerForEvent(USER_ID, EVENT_ID, TICKET_ID))
                    .thenThrow(new DuplicateRegistrationException(USER_ID, EVENT_ID));

            mockMvc.perform(post("/events/{eventId}/registrations", EVENT_ID)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"ticketId\": \"" + TICKET_ID + "\"}"))
                    .andExpect(status().isConflict());
        }

        @Test
        @DisplayName("unhappy path – returns 404 when event does not exist")
        void createRegistration_eventNotFound_returns404() throws Exception {
            when(registrationService.registerForEvent(USER_ID, EVENT_ID, TICKET_ID))
                    .thenThrow(new EventNotFoundException(EVENT_ID));

            mockMvc.perform(post("/events/{eventId}/registrations", EVENT_ID)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"ticketId\": \"" + TICKET_ID + "\"}"))
                    .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("unhappy path – returns 400 when ticketId is blank")
        void createRegistration_blankTicketId_returns400() throws Exception {
            mockMvc.perform(post("/events/{eventId}/registrations", EVENT_ID)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"ticketId\": \"\"}"))
                    .andExpect(status().isBadRequest());
        }
    }

    // -------------------------------------------------------------------------
    // GET /events/{eventId}/registrations
    // -------------------------------------------------------------------------
    @Nested
    @DisplayName("GET /events/{eventId}/registrations")
    class GetRegistrationsByEvent {

        @Test
        @DisplayName("happy path – returns 200 with paginated registrations")
        void getRegistrationsByEvent_happyPath() throws Exception {
            var responseDto = new RegistrationListResponseDto(
                    List.of(registrationDto), 0, 10, 1L, 1);
            when(registrationService.getRegistrationsByEventIdStatus(eq(USER_ID), eq(EVENT_ID), any(), eq(10), eq(0)))
                    .thenReturn(responseDto);

            mockMvc.perform(get("/events/{eventId}/registrations", EVENT_ID)
                            .param("size", "10")
                            .param("page", "0"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.totalElements").value(1));
        }
    }

    // -------------------------------------------------------------------------
    // GET /events/{eventId}/my-registration
    // -------------------------------------------------------------------------
    @Nested
    @DisplayName("GET /events/{eventId}/my-registration")
    class GetMyRegistration {

        @Test
        @DisplayName("happy path – returns 200 with own registration")
        void getMyRegistration_happyPath() throws Exception {
            when(registrationService.getRegistrationByEventIdAndUserId(USER_ID, EVENT_ID, USER_ID))
                    .thenReturn(registrationDto);

            mockMvc.perform(get("/events/{eventId}/my-registration", EVENT_ID))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.registrationId").value(REG_ID))
                    .andExpect(jsonPath("$.attendeeId").value(USER_ID));
        }

        @Test
        @DisplayName("unhappy path – returns 404 when no registration found for this user/event")
        void getMyRegistration_notFound() throws Exception {
            when(registrationService.getRegistrationByEventIdAndUserId(USER_ID, EVENT_ID, USER_ID))
                    .thenThrow(new RegistrationNotFoundException("Registration not found"));

            mockMvc.perform(get("/events/{eventId}/my-registration", EVENT_ID))
                    .andExpect(status().isNotFound());
        }
    }

    // -------------------------------------------------------------------------
    // GET /registrations/{registrationId}
    // -------------------------------------------------------------------------
    @Nested
    @DisplayName("GET /registrations/{registrationId}")
    class GetRegistrationById {

        @Test
        @DisplayName("happy path – returns 200 with registration body")
        void getRegistrationById_happyPath() throws Exception {
            when(registrationService.getRegistrationById(USER_ID, REG_ID)).thenReturn(registrationDto);

            mockMvc.perform(get("/registrations/{registrationId}", REG_ID))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.registrationId").value(REG_ID));
        }

        @Test
        @DisplayName("unhappy path – returns 404 when registration does not exist")
        void getRegistrationById_notFound() throws Exception {
            when(registrationService.getRegistrationById(USER_ID, REG_ID))
                    .thenThrow(new RegistrationNotFoundException("Registration with id '" + REG_ID + "' not found"));

            mockMvc.perform(get("/registrations/{registrationId}", REG_ID))
                    .andExpect(status().isNotFound());
        }
    }

    // -------------------------------------------------------------------------
    // GET /events/{eventId}/registrations/attendee/{attendeeId}
    // -------------------------------------------------------------------------
    @Nested
    @DisplayName("GET /events/{eventId}/registrations/attendee/{attendeeId}")
    class GetRegistrationByAttendee {

        @Test
        @DisplayName("happy path – returns 200 with attendee's registration")
        void getRegistrationByAttendee_happyPath() throws Exception {
            when(registrationService.getRegistrationByEventIdAndUserId(USER_ID, EVENT_ID, USER_ID))
                    .thenReturn(registrationDto);

            mockMvc.perform(get("/events/{eventId}/registrations/attendee/{attendeeId}", EVENT_ID, USER_ID))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.attendeeId").value(USER_ID));
        }
    }

    // -------------------------------------------------------------------------
    // PATCH /registrations/{registrationId}/cancel
    // -------------------------------------------------------------------------
    @Nested
    @DisplayName("PATCH /registrations/{registrationId}/cancel")
    class CancelRegistration {

        @Test
        @DisplayName("happy path – returns 200 with cancellation message")
        void cancelRegistration_happyPath() throws Exception {
            when(registrationService.cancelRegistration(USER_ID, REG_ID))
                    .thenReturn(new GenericResponse("Registration cancelled successfully"));

            mockMvc.perform(patch("/registrations/{registrationId}/cancel", REG_ID))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.message").value("Registration cancelled successfully"));
        }

        @Test
        @DisplayName("unhappy path – returns 404 when registration not found")
        void cancelRegistration_notFound() throws Exception {
            when(registrationService.cancelRegistration(USER_ID, REG_ID))
                    .thenThrow(new RegistrationNotFoundException("Registration with id '" + REG_ID + "' not found"));

            mockMvc.perform(patch("/registrations/{registrationId}/cancel", REG_ID))
                    .andExpect(status().isNotFound());
        }
    }

    // -------------------------------------------------------------------------
    // PATCH /registrations/{registrationId}/check-in
    // -------------------------------------------------------------------------
    @Nested
    @DisplayName("PATCH /registrations/{registrationId}/check-in")
    class CheckInRegistration {

        @Test
        @DisplayName("happy path – returns 200 with check-in message")
        void checkIn_happyPath() throws Exception {
            when(registrationService.checkInRegistration(USER_ID, REG_ID))
                    .thenReturn(new GenericResponse("Check-in successful"));

            mockMvc.perform(patch("/registrations/{registrationId}/check-in", REG_ID))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.message").value("Check-in successful"));
        }

        @Test
        @DisplayName("unhappy path – returns 400 when registration status is not CONFIRMED")
        void checkIn_invalidStatus_returns400() throws Exception {
            when(registrationService.checkInRegistration(USER_ID, REG_ID))
                    .thenThrow(new InvalidRegistrationStatusException("User not confirmed for event '" + EVENT_ID + "'"));

            mockMvc.perform(patch("/registrations/{registrationId}/check-in", REG_ID))
                    .andExpect(status().isBadRequest());
        }
    }

    // -------------------------------------------------------------------------
    // PATCH /registrations/{registrationId}/approve
    // -------------------------------------------------------------------------
    @Nested
    @DisplayName("PATCH /registrations/{registrationId}/approve")
    class ApproveRegistration {

        @Test
        @DisplayName("happy path – returns 200 with approval message")
        void approve_happyPath() throws Exception {
            when(registrationService.approveRegistration(USER_ID, REG_ID))
                    .thenReturn(new GenericResponse("Registration approved successfully"));

            mockMvc.perform(patch("/registrations/{registrationId}/approve", REG_ID))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.message").value("Registration approved successfully"));
        }

        @Test
        @DisplayName("unhappy path – returns 404 when registration not found")
        void approve_notFound() throws Exception {
            when(registrationService.approveRegistration(USER_ID, REG_ID))
                    .thenThrow(new RegistrationNotFoundException("Registration with id '" + REG_ID + "' not found"));

            mockMvc.perform(patch("/registrations/{registrationId}/approve", REG_ID))
                    .andExpect(status().isNotFound());
        }
    }

    // -------------------------------------------------------------------------
    // PATCH /registrations/{registrationId}/reject
    // -------------------------------------------------------------------------
    @Nested
    @DisplayName("PATCH /registrations/{registrationId}/reject")
    class RejectRegistration {

        @Test
        @DisplayName("happy path – returns 200 with rejection message")
        void reject_happyPath() throws Exception {
            when(registrationService.rejectRegistration(USER_ID, REG_ID))
                    .thenReturn(new GenericResponse("Registration rejected successfully"));

            mockMvc.perform(patch("/registrations/{registrationId}/reject", REG_ID))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.message").value("Registration rejected successfully"));
        }

        @Test
        @DisplayName("unhappy path – returns 404 when registration not found")
        void reject_notFound() throws Exception {
            when(registrationService.rejectRegistration(USER_ID, REG_ID))
                    .thenThrow(new RegistrationNotFoundException("Registration with id '" + REG_ID + "' not found"));

            mockMvc.perform(patch("/registrations/{registrationId}/reject", REG_ID))
                    .andExpect(status().isNotFound());
        }
    }
}
