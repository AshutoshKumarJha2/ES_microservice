package com.cts.eventsphere.eventmanager.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.cts.eventsphere.eventmanager.auth.dto.UserPrincipal;
import com.cts.eventsphere.eventmanager.dto.event.EventRequestDto;
import com.cts.eventsphere.eventmanager.dto.event.EventResponseDto;
import com.cts.eventsphere.eventmanager.dto.schedule.ScheduleRequestDto;
import com.cts.eventsphere.eventmanager.dto.schedule.ScheduleResponseDto;
import com.cts.eventsphere.eventmanager.exception.GlobalExceptionHandler;
import com.cts.eventsphere.eventmanager.exception.event.EventNotFoundException;
import com.cts.eventsphere.eventmanager.model.data.EventStatus;
import com.cts.eventsphere.eventmanager.model.data.ScheduleStatus;
import com.cts.eventsphere.eventmanager.service.AuditService;
import com.cts.eventsphere.eventmanager.service.EventService;
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
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.method.annotation.AuthenticationPrincipalArgumentResolver;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDate;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class EventControllerTest {

    @Mock private EventService eventService;
    @Mock private AuditService auditService;

    @InjectMocks private EventController eventController;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    private static final String USER_ID  = "user-001";
    private static final String EVENT_ID = "event-001";
    private static final String SCHED_ID = "sched-001";

    private EventResponseDto eventResponse;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper()
                .registerModule(new JavaTimeModule())
                .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

        mockMvc = MockMvcBuilders
                .standaloneSetup(eventController)
                .setCustomArgumentResolvers(new AuthenticationPrincipalArgumentResolver())
                .setControllerAdvice(new GlobalExceptionHandler(auditService))
                .setMessageConverters(new MappingJackson2HttpMessageConverter(objectMapper))
                .build();

        var principal = new UserPrincipal(USER_ID, "ORGANIZER",
                List.of(new SimpleGrantedAuthority("ROLE_ORGANIZER")));
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(principal, null, principal.authorities()));

        eventResponse = EventResponseDto.builder()
                .id(EVENT_ID)
                .eventName("Tech Summit")
                .organizerId("org-001")
                .startAt(LocalDate.now().plusDays(1).toString())
                .endAt(LocalDate.now().plusDays(5).toString())
                .status(EventStatus.published)
                .venueId("venue-001")
                .build();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    // -------------------------------------------------------------------------
    // POST /events
    // -------------------------------------------------------------------------
    @Nested
    @DisplayName("POST /events")
    class CreateEvent {

        @Test
        @DisplayName("happy path – returns 201 with created event body")
        void create_happyPath() throws Exception {
            when(eventService.create(eq(USER_ID), any(EventRequestDto.class))).thenReturn(eventResponse);

            String body = """
                    {
                      "name": "Tech Summit",
                      "organizerId": "org-001",
                      "startDate": "%s",
                      "endDate": "%s",
                      "venueId": "venue-001",
                      "status": "published"
                    }
                    """.formatted(
                    LocalDate.now().plusDays(1),
                    LocalDate.now().plusDays(5));

            mockMvc.perform(post("/events")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.id").value(EVENT_ID))
                    .andExpect(jsonPath("$.eventName").value("Tech Summit"));
        }

        @Test
        @DisplayName("unhappy path – returns 400 when request body is missing required fields")
        void create_missingName_returns400() throws Exception {
            String body = """
                    {
                      "organizerId": "org-001",
                      "startDate": "%s",
                      "endDate": "%s"
                    }
                    """.formatted(LocalDate.now().plusDays(1), LocalDate.now().plusDays(5));

            mockMvc.perform(post("/events")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body))
                    .andExpect(status().isBadRequest());
        }
    }

    // -------------------------------------------------------------------------
    // GET /events
    // -------------------------------------------------------------------------
    @Nested
    @DisplayName("GET /events")
    class GetAllEvents {

        @Test
        @DisplayName("happy path – returns 200 with list of events")
        void readAll_happyPath() throws Exception {
            when(eventService.findAllEvents(USER_ID)).thenReturn(List.of(eventResponse));

            mockMvc.perform(get("/events"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(1)))
                    .andExpect(jsonPath("$[0].id").value(EVENT_ID));
        }

        @Test
        @DisplayName("happy path – returns 200 with empty list when no events exist")
        void readAll_empty() throws Exception {
            when(eventService.findAllEvents(USER_ID)).thenReturn(List.of());

            mockMvc.perform(get("/events"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(0)));
        }
    }

    // -------------------------------------------------------------------------
    // GET /events/{id}
    // -------------------------------------------------------------------------
    @Nested
    @DisplayName("GET /events/{id}")
    class GetEventById {

        @Test
        @DisplayName("happy path – returns 200 with event body")
        void getById_happyPath() throws Exception {
            when(eventService.findById(EVENT_ID, USER_ID)).thenReturn(eventResponse);

            mockMvc.perform(get("/events/{id}", EVENT_ID))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(EVENT_ID))
                    .andExpect(jsonPath("$.eventName").value("Tech Summit"));
        }

        @Test
        @DisplayName("unhappy path – returns 404 when event does not exist")
        void getById_notFound() throws Exception {
            when(eventService.findById(EVENT_ID, USER_ID))
                    .thenThrow(new EventNotFoundException(EVENT_ID));

            mockMvc.perform(get("/events/{id}", EVENT_ID))
                    .andExpect(status().isNotFound());
        }
    }

    // -------------------------------------------------------------------------
    // PUT /events/{id}
    // -------------------------------------------------------------------------
    @Nested
    @DisplayName("PUT /events/{id}")
    class UpdateEvent {

        @Test
        @DisplayName("happy path – returns 204 NO_CONTENT on successful update")
        void update_happyPath() throws Exception {
            when(eventService.updateById(eq(EVENT_ID), any(EventRequestDto.class), eq(USER_ID)))
                    .thenReturn(true);

            String body = """
                    {
                      "name": "Tech Summit Updated",
                      "organizerId": "org-001",
                      "startDate": "%s",
                      "endDate": "%s",
                      "status": "published"
                    }
                    """.formatted(LocalDate.now().plusDays(1), LocalDate.now().plusDays(5));

            mockMvc.perform(put("/events/{id}", EVENT_ID)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body))
                    .andExpect(status().isNoContent());
        }

        @Test
        @DisplayName("unhappy path – returns 404 when event does not exist")
        void update_notFound() throws Exception {
            when(eventService.updateById(eq(EVENT_ID), any(EventRequestDto.class), eq(USER_ID)))
                    .thenThrow(new EventNotFoundException(EVENT_ID));

            String body = """
                    {
                      "name": "Tech Summit Updated",
                      "organizerId": "org-001",
                      "startDate": "%s",
                      "endDate": "%s",
                      "status": "published"
                    }
                    """.formatted(LocalDate.now().plusDays(1), LocalDate.now().plusDays(5));

            mockMvc.perform(put("/events/{id}", EVENT_ID)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body))
                    .andExpect(status().isNotFound());
        }
    }

    // -------------------------------------------------------------------------
    // DELETE /events/{id}
    // -------------------------------------------------------------------------
    @Nested
    @DisplayName("DELETE /events/{id}")
    class DeleteEvent {

        @Test
        @DisplayName("happy path – returns 204 NO_CONTENT on successful deletion")
        void delete_happyPath() throws Exception {
            when(eventService.deleteById(EVENT_ID, USER_ID)).thenReturn(true);

            mockMvc.perform(delete("/events/{id}", EVENT_ID))
                    .andExpect(status().isNoContent());
        }

        @Test
        @DisplayName("unhappy path – returns 404 when event does not exist")
        void delete_notFound() throws Exception {
            when(eventService.deleteById(EVENT_ID, USER_ID))
                    .thenThrow(new EventNotFoundException(EVENT_ID));

            mockMvc.perform(delete("/events/{id}", EVENT_ID))
                    .andExpect(status().isNotFound());
        }
    }

    // -------------------------------------------------------------------------
    // POST /events/{id}/schedules
    // -------------------------------------------------------------------------
    @Nested
    @DisplayName("POST /events/{id}/schedules")
    class CreateActivity {

        @Test
        @DisplayName("happy path – returns 201 with created schedule body")
        void createActivity_happyPath() throws Exception {
            ScheduleResponseDto scheduleResponse = ScheduleResponseDto.builder()
                    .scheduleId(SCHED_ID)
                    .eventId(EVENT_ID)
                    .date(LocalDate.now().plusDays(1).toString())
                    .timeSlot("09:00-10:00")
                    .activity("Keynote")
                    .status(ScheduleStatus.active)
                    .build();

            when(eventService.addActivity(eq(EVENT_ID), any(ScheduleRequestDto.class), eq(USER_ID)))
                    .thenReturn(scheduleResponse);

            String body = """
                    {
                      "eventId": "%s",
                      "date": "%s",
                      "timeSlot": "09:00-10:00",
                      "activity": "Keynote",
                      "status": "active"
                    }
                    """.formatted(EVENT_ID, LocalDate.now().plusDays(1));

            mockMvc.perform(post("/events/{id}/schedules", EVENT_ID)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.scheduleId").value(SCHED_ID))
                    .andExpect(jsonPath("$.activity").value("Keynote"));
        }

        @Test
        @DisplayName("unhappy path – returns 404 when parent event does not exist")
        void createActivity_eventNotFound() throws Exception {
            when(eventService.addActivity(eq(EVENT_ID), any(ScheduleRequestDto.class), eq(USER_ID)))
                    .thenThrow(new EventNotFoundException(EVENT_ID));

            String body = """
                    {
                      "eventId": "%s",
                      "date": "%s",
                      "timeSlot": "09:00-10:00",
                      "activity": "Keynote",
                      "status": "active"
                    }
                    """.formatted(EVENT_ID, LocalDate.now().plusDays(1));

            mockMvc.perform(post("/events/{id}/schedules", EVENT_ID)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body))
                    .andExpect(status().isNotFound());
        }
    }

    // -------------------------------------------------------------------------
    // GET /events/{id}/schedules
    // -------------------------------------------------------------------------
    @Nested
    @DisplayName("GET /events/{id}/schedules")
    class GetAllActivities {

        @Test
        @DisplayName("happy path – returns 200 with list of schedules")
        void getAllActivity_happyPath() throws Exception {
            ScheduleResponseDto scheduleResponse = ScheduleResponseDto.builder()
                    .scheduleId(SCHED_ID)
                    .eventId(EVENT_ID)
                    .date(LocalDate.now().plusDays(1).toString())
                    .timeSlot("09:00-10:00")
                    .activity("Keynote")
                    .status(ScheduleStatus.active)
                    .build();

            when(eventService.findAllSchedules(EVENT_ID, USER_ID)).thenReturn(List.of(scheduleResponse));

            mockMvc.perform(get("/events/{id}/schedules", EVENT_ID))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(1)))
                    .andExpect(jsonPath("$[0].scheduleId").value(SCHED_ID));
        }
    }
}
