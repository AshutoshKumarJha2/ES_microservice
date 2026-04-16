package com.eventsphere.engagement_manager.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.eventsphere.engagement_manager.Exception.EngagementNotFoundException;
import com.eventsphere.engagement_manager.Exception.GlobalExceptionHandler;
import com.eventsphere.engagement_manager.Exception.InvalidEngagementException;
import com.eventsphere.engagement_manager.dto.engagement.EngagementResponseDto;
import com.eventsphere.engagement_manager.model.data.EngagementType;
import com.eventsphere.engagement_manager.service.AuditService;
import com.eventsphere.engagement_manager.service.EngagementService;
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
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDateTime;
import java.util.List;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class EngagementControllerTest {

    @Mock private EngagementService engagementService;
    @Mock private AuditService auditService;
    @InjectMocks private EngagementController engagementController;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    private static final String EVENT_ID    = "event-001";
    private static final String ATTENDEE_ID = "attendee-001";
    private static final String ENG_ID      = "eng-001";

    // Valid UUIDs for request body (UUID pattern validation)
    private static final String VALID_EVENT_UUID    = "12345678-1234-1234-1234-123456789012";
    private static final String VALID_ATTENDEE_UUID = "87654321-4321-4321-4321-210987654321";

    private EngagementResponseDto sampleResponse;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper()
                .registerModule(new JavaTimeModule())
                .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

        mockMvc = MockMvcBuilders
                .standaloneSetup(engagementController)
                .setControllerAdvice(new GlobalExceptionHandler(auditService))
                .setMessageConverters(new MappingJackson2HttpMessageConverter(objectMapper))
                .build();

        sampleResponse = EngagementResponseDto.builder()
                .engagementId(ENG_ID)
                .eventId(EVENT_ID)
                .attendeeId(ATTENDEE_ID)
                .activity(EngagementType.SESSION_JOIN)
                .activityTimestamp(LocalDateTime.now().minusMinutes(5))
                .build();
    }

    // -------------------------------------------------------------------------
    // POST /engagements/log
    // -------------------------------------------------------------------------
    @Nested
    @DisplayName("POST /engagements/log")
    class LogEngagement {

        @Test
        @DisplayName("happy path – returns 201 with created engagement")
        void logEngagement_happyPath_returns201() throws Exception {
            when(engagementService.recordEngagement(any())).thenReturn(sampleResponse);

            String body = """
                    {
                      "eventId": "%s",
                      "attendeeId": "%s",
                      "activity": "SESSION_JOIN",
                      "activityTimestamp": "%s"
                    }
                    """.formatted(VALID_EVENT_UUID, VALID_ATTENDEE_UUID,
                    LocalDateTime.now().minusMinutes(1));

            mockMvc.perform(post("/engagements/log")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.engagementId").value(ENG_ID))
                    .andExpect(jsonPath("$.activity").value("SESSION_JOIN"));
        }

        @Test
        @DisplayName("unhappy path – returns 400 when eventId is blank")
        void logEngagement_blankEventId_returns400() throws Exception {
            String body = """
                    {
                      "eventId": "",
                      "attendeeId": "%s",
                      "activity": "SESSION_JOIN",
                      "activityTimestamp": "%s"
                    }
                    """.formatted(VALID_ATTENDEE_UUID, LocalDateTime.now().minusMinutes(1));

            mockMvc.perform(post("/engagements/log")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("unhappy path – returns 400 when activity is null")
        void logEngagement_nullActivity_returns400() throws Exception {
            String body = """
                    {
                      "eventId": "%s",
                      "attendeeId": "%s",
                      "activityTimestamp": "%s"
                    }
                    """.formatted(VALID_EVENT_UUID, VALID_ATTENDEE_UUID,
                    LocalDateTime.now().minusMinutes(1));

            mockMvc.perform(post("/engagements/log")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("unhappy path – returns 400 when service throws InvalidEngagementException")
        void logEngagement_futureTimestamp_returns400() throws Exception {
            when(engagementService.recordEngagement(any()))
                    .thenThrow(new InvalidEngagementException("Engagement timestamp cannot be in the future"));

            String body = """
                    {
                      "eventId": "%s",
                      "attendeeId": "%s",
                      "activity": "SESSION_JOIN",
                      "activityTimestamp": "%s"
                    }
                    """.formatted(VALID_EVENT_UUID, VALID_ATTENDEE_UUID,
                    LocalDateTime.now().minusMinutes(1));

            mockMvc.perform(post("/engagements/log")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body))
                    .andExpect(status().isBadRequest());
        }
    }

    // -------------------------------------------------------------------------
    // GET /engagements/event/{eventId}/log
    // -------------------------------------------------------------------------
    @Nested
    @DisplayName("GET /engagements/event/{eventId}/log")
    class GetByEvent {

        @Test
        @DisplayName("happy path – returns 200 with engagement list")
        void getByEvent_happyPath_returns200() throws Exception {
            when(engagementService.getByEvent(EVENT_ID)).thenReturn(List.of(sampleResponse));

            mockMvc.perform(get("/engagements/event/{eventId}/log", EVENT_ID))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(1)))
                    .andExpect(jsonPath("$[0].engagementId").value(ENG_ID));
        }

        @Test
        @DisplayName("unhappy path – returns 404 when no engagements found for event")
        void getByEvent_noEngagements_returns404() throws Exception {
            when(engagementService.getByEvent(EVENT_ID))
                    .thenThrow(new EngagementNotFoundException("No engagements found for event: " + EVENT_ID));

            mockMvc.perform(get("/engagements/event/{eventId}/log", EVENT_ID))
                    .andExpect(status().isNotFound());
        }
    }

    // -------------------------------------------------------------------------
    // GET /engagements/activity/{activity}/log
    // -------------------------------------------------------------------------
    @Nested
    @DisplayName("GET /engagements/activity/{activity}/log")
    class GetByActivity {

        @Test
        @DisplayName("happy path – returns 200 with engagement list for activity type")
        void getByActivity_happyPath_returns200() throws Exception {
            when(engagementService.getByActivityType(EngagementType.SESSION_JOIN))
                    .thenReturn(List.of(sampleResponse));

            mockMvc.perform(get("/engagements/activity/{activity}/log", "SESSION_JOIN"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(1)));
        }

        @Test
        @DisplayName("unhappy path – returns 404 when no engagements found for activity")
        void getByActivity_noEngagements_returns404() throws Exception {
            when(engagementService.getByActivityType(EngagementType.POLL_VOTE))
                    .thenThrow(new EngagementNotFoundException("No engagements found for activity type: POLL_VOTE"));

            mockMvc.perform(get("/engagements/activity/{activity}/log", "POLL_VOTE"))
                    .andExpect(status().isNotFound());
        }
    }

    // -------------------------------------------------------------------------
    // GET /engagements/filter
    // -------------------------------------------------------------------------
    @Nested
    @DisplayName("GET /engagements/filter")
    class GetDetailedFilter {

        @Test
        @DisplayName("happy path – returns 200 with filtered engagement list")
        void getFilter_happyPath_returns200() throws Exception {
            when(engagementService.getFilteredEngagements(
                    eq(EVENT_ID), eq(EngagementType.SESSION_JOIN), any(), any()))
                    .thenReturn(List.of(sampleResponse));

            mockMvc.perform(get("/engagements/filter")
                            .param("eventId", EVENT_ID)
                            .param("activity", "SESSION_JOIN")
                            .param("start", "2026-03-01T00:00:00")
                            .param("end", "2026-03-31T23:59:59"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(1)));
        }

        @Test
        @DisplayName("unhappy path – returns 400 when service throws InvalidEngagementException")
        void getFilter_invalidDateRange_returns400() throws Exception {
            when(engagementService.getFilteredEngagements(any(), any(), any(), any()))
                    .thenThrow(new InvalidEngagementException("Start date must be before end date"));

            mockMvc.perform(get("/engagements/filter")
                            .param("eventId", EVENT_ID)
                            .param("activity", "SESSION_JOIN")
                            .param("start", "2026-03-31T00:00:00")
                            .param("end", "2026-03-01T00:00:00"))
                    .andExpect(status().isBadRequest());
        }
    }
}
