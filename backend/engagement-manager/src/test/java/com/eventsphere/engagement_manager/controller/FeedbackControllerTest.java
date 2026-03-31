package com.eventsphere.engagement_manager.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.eventsphere.engagement_manager.Exception.FeedbackNotFoundException;
import com.eventsphere.engagement_manager.Exception.GlobalExceptionHandler;
import com.eventsphere.engagement_manager.dto.feedback.FeedbackResponseDto;
import com.eventsphere.engagement_manager.service.FeedbackService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.web.PageableHandlerMethodArgumentResolver;
import org.springframework.http.MediaType;
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
class FeedbackControllerTest {

    @Mock private FeedbackService feedbackService;
    @InjectMocks private FeedbackController feedbackController;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    private static final String EVENT_ID    = "event-001";
    private static final String FEEDBACK_ID = "feedback-001";
    private static final String ATTENDEE_ID = "attendee-001";

    // Valid UUIDs satisfying UUID pattern validation on FeedbackRequestDto
    private static final String VALID_EVENT_UUID    = "12345678-1234-1234-1234-123456789012";
    private static final String VALID_ATTENDEE_UUID = "87654321-4321-4321-4321-210987654321";

    private FeedbackResponseDto sampleResponse;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper()
                .registerModule(new JavaTimeModule())
                .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

        mockMvc = MockMvcBuilders
                .standaloneSetup(feedbackController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .setCustomArgumentResolvers(new PageableHandlerMethodArgumentResolver())
                .build();

        sampleResponse = FeedbackResponseDto.builder()
                .feedbackId(FEEDBACK_ID)
                .eventId(EVENT_ID)
                .attendeeId(ATTENDEE_ID)
                .rating(4)
                .comments("Great event!")
                .createdAt(LocalDateTime.now().minusMinutes(10))
                .build();
    }

    // -------------------------------------------------------------------------
    // POST /feedback
    // -------------------------------------------------------------------------
    @Nested
    @DisplayName("POST /feedback")
    class CreateFeedback {

        @Test
        @DisplayName("happy path – returns 201 with created feedback")
        void create_happyPath_returns201() throws Exception {
            when(feedbackService.create(any(), any())).thenReturn(sampleResponse);

            String body = """
                    {
                      "eventId": "%s",
                      "attendeeId": "%s",
                      "rating": 4,
                      "comments": "Great event!",
                      "createdAt": "%s"
                    }
                    """.formatted(VALID_EVENT_UUID, VALID_ATTENDEE_UUID,
                    LocalDateTime.now().minusMinutes(10));

            mockMvc.perform(post("/feedback")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.feedbackId").value(FEEDBACK_ID))
                    .andExpect(jsonPath("$.rating").value(4));
        }

        @Test
        @DisplayName("unhappy path – returns 400 when eventId is blank")
        void create_blankEventId_returns400() throws Exception {
            String body = """
                    {
                      "eventId": "",
                      "attendeeId": "%s",
                      "rating": 4,
                      "comments": "Great event!",
                      "createdAt": "%s"
                    }
                    """.formatted(VALID_ATTENDEE_UUID, LocalDateTime.now().minusMinutes(10));

            mockMvc.perform(post("/feedback")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("unhappy path – returns 400 when rating exceeds maximum (>5)")
        void create_ratingTooHigh_returns400() throws Exception {
            String body = """
                    {
                      "eventId": "%s",
                      "attendeeId": "%s",
                      "rating": 6,
                      "comments": "Great event!",
                      "createdAt": "%s"
                    }
                    """.formatted(VALID_EVENT_UUID, VALID_ATTENDEE_UUID,
                    LocalDateTime.now().minusMinutes(10));

            mockMvc.perform(post("/feedback")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("unhappy path – returns 400 when rating is below minimum (<1)")
        void create_ratingTooLow_returns400() throws Exception {
            String body = """
                    {
                      "eventId": "%s",
                      "attendeeId": "%s",
                      "rating": 0,
                      "comments": "Great event!",
                      "createdAt": "%s"
                    }
                    """.formatted(VALID_EVENT_UUID, VALID_ATTENDEE_UUID,
                    LocalDateTime.now().minusMinutes(10));

            mockMvc.perform(post("/feedback")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("unhappy path – returns 400 when createdAt is in the future")
        void create_futureTimestamp_returns400() throws Exception {
            String body = """
                    {
                      "eventId": "%s",
                      "attendeeId": "%s",
                      "rating": 4,
                      "comments": "Great event!",
                      "createdAt": "%s"
                    }
                    """.formatted(VALID_EVENT_UUID, VALID_ATTENDEE_UUID,
                    LocalDateTime.now().plusHours(1));

            mockMvc.perform(post("/feedback")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body))
                    .andExpect(status().isBadRequest());
        }
    }

    // -------------------------------------------------------------------------
    // GET /feedback/{id}
    // -------------------------------------------------------------------------
    @Nested
    @DisplayName("GET /feedback/{id}")
    class GetById {

        @Test
        @DisplayName("happy path – returns 200 with feedback details")
        void getById_happyPath_returns200() throws Exception {
            when(feedbackService.getById(FEEDBACK_ID)).thenReturn(sampleResponse);

            mockMvc.perform(get("/feedback/{id}", FEEDBACK_ID))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.feedbackId").value(FEEDBACK_ID))
                    .andExpect(jsonPath("$.comments").value("Great event!"))
                    .andExpect(jsonPath("$.rating").value(4));
        }

        @Test
        @DisplayName("unhappy path – returns 404 when feedback not found")
        void getById_notFound_returns404() throws Exception {
            when(feedbackService.getById(FEEDBACK_ID))
                    .thenThrow(new FeedbackNotFoundException("Feedback not found: " + FEEDBACK_ID));

            mockMvc.perform(get("/feedback/{id}", FEEDBACK_ID))
                    .andExpect(status().isNotFound());
        }
    }

    // -------------------------------------------------------------------------
    // GET /feedback/event/{eventId}
    // -------------------------------------------------------------------------
    @Nested
    @DisplayName("GET /feedback/event/{eventId}")
    class ListByEvent {

        @Test
        @DisplayName("happy path – returns 200 with paginated feedback list")
        void listByEvent_happyPath_returns200() throws Exception {
            Page<FeedbackResponseDto> page = new PageImpl<>(List.of(sampleResponse),
                    PageRequest.of(0, 10), 1);
            when(feedbackService.listByEvent(eq(EVENT_ID), any())).thenReturn(page);

            mockMvc.perform(get("/feedback/event/{eventId}", EVENT_ID)
                            .param("page", "0")
                            .param("size", "10"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content", hasSize(1)))
                    .andExpect(jsonPath("$.content[0].feedbackId").value(FEEDBACK_ID));
        }

        @Test
        @DisplayName("happy path – returns 200 with empty page when no feedback exists for event")
        void listByEvent_empty_returns200WithEmptyPage() throws Exception {
            when(feedbackService.listByEvent(eq(EVENT_ID), any())).thenReturn(Page.empty());

            mockMvc.perform(get("/feedback/event/{eventId}", EVENT_ID))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content", hasSize(0)));
        }
    }

    // -------------------------------------------------------------------------
    // DELETE /feedback/{feedbackId}
    // -------------------------------------------------------------------------
    @Nested
    @DisplayName("DELETE /feedback/{feedbackId}")
    class DeleteFeedback {

        @Test
        @DisplayName("happy path – returns 204 on successful deletion")
        void delete_happyPath_returns204() throws Exception {
            doNothing().when(feedbackService).delete(FEEDBACK_ID);

            mockMvc.perform(delete("/feedback/{feedbackId}", FEEDBACK_ID))
                    .andExpect(status().isNoContent());

            verify(feedbackService).delete(FEEDBACK_ID);
        }

        @Test
        @DisplayName("unhappy path – returns 404 when feedback not found")
        void delete_notFound_returns404() throws Exception {
            doThrow(new FeedbackNotFoundException("Feedback not found: " + FEEDBACK_ID))
                    .when(feedbackService).delete(FEEDBACK_ID);

            mockMvc.perform(delete("/feedback/{feedbackId}", FEEDBACK_ID))
                    .andExpect(status().isNotFound());
        }
    }
}
