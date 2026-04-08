package com.cts.eventsphere.eventmanager.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.cts.eventsphere.eventmanager.dto.schedule.ScheduleRequestDto;
import com.cts.eventsphere.eventmanager.dto.schedule.ScheduleResponseDto;
import com.cts.eventsphere.eventmanager.exception.GlobalExceptionHandler;
import com.cts.eventsphere.eventmanager.exception.event.EventNotFoundException;
import com.cts.eventsphere.eventmanager.exception.schedule.ScheduleNotFoundException;
import com.cts.eventsphere.eventmanager.model.data.ScheduleStatus;
import com.cts.eventsphere.eventmanager.service.AuditService;
import com.cts.eventsphere.eventmanager.service.ScheduleService;
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

import java.time.LocalDate;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class ScheduleControllerTest {

    @Mock private ScheduleService scheduleService;
    @Mock private AuditService auditService;

    @InjectMocks private ScheduleController scheduleController;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    private static final String EVENT_ID = "event-001";
    private static final String SCHED_ID = "sched-001";

    private ScheduleResponseDto scheduleResponse;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper()
                .registerModule(new JavaTimeModule())
                .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

        mockMvc = MockMvcBuilders
                .standaloneSetup(scheduleController)
                .setControllerAdvice(new GlobalExceptionHandler(auditService))
                .setMessageConverters(new MappingJackson2HttpMessageConverter(objectMapper))
                .build();

        scheduleResponse = ScheduleResponseDto.builder()
                .scheduleId(SCHED_ID)
                .eventId(EVENT_ID)
                .date(LocalDate.now().plusDays(1).toString())
                .timeSlot("09:00-10:00")
                .activity("Opening Keynote")
                .status(ScheduleStatus.ACTIVE)
                .build();
    }

    // -------------------------------------------------------------------------
    // POST /events/{eventId}/schedules/{id}   (update)
    // -------------------------------------------------------------------------
    @Nested
    @DisplayName("POST /events/{eventId}/schedules/{id}")
    class UpdateSchedule {

        private String validBody() {
            return """
                    {
                      "eventId": "%s",
                      "date": "%s",
                      "timeSlot": "09:00-10:00",
                      "activity": "Opening Keynote",
                      "status": "ACTIVE"
                    }
                    """.formatted(EVENT_ID, LocalDate.now().plusDays(1));
        }

        @Test
        @DisplayName("happy path – returns 200 with updated schedule")
        void update_happyPath() throws Exception {
            when(scheduleService.updateById(eq(EVENT_ID), eq(SCHED_ID), any(ScheduleRequestDto.class)))
                    .thenReturn(scheduleResponse);

            mockMvc.perform(put("/events/{eventId}/schedules/{id}", EVENT_ID, SCHED_ID)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(validBody()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.scheduleId").value(SCHED_ID))
                    .andExpect(jsonPath("$.activity").value("Opening Keynote"))
                    .andExpect(jsonPath("$.timeSlot").value("09:00-10:00"));
        }

        @Test
        @DisplayName("unhappy path – returns 404 when schedule does not exist")
        void update_scheduleNotFound() throws Exception {
            when(scheduleService.updateById(eq(EVENT_ID), eq(SCHED_ID), any(ScheduleRequestDto.class)))
                    .thenThrow(new ScheduleNotFoundException(SCHED_ID));

            mockMvc.perform(put("/events/{eventId}/schedules/{id}", EVENT_ID, SCHED_ID)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(validBody()))
                    .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("unhappy path – returns 404 when parent event does not exist")
        void update_eventNotFound() throws Exception {
            when(scheduleService.updateById(eq(EVENT_ID), eq(SCHED_ID), any(ScheduleRequestDto.class)))
                    .thenThrow(new EventNotFoundException(EVENT_ID));

            mockMvc.perform(put("/events/{eventId}/schedules/{id}", EVENT_ID, SCHED_ID)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(validBody()))
                    .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("unhappy path – returns 400 when request body has invalid timeSlot format")
        void update_invalidTimeSlot_returns400() throws Exception {
            String invalidBody = """
                    {
                      "eventId": "%s",
                      "date": "%s",
                      "timeSlot": "bad-format",
                      "activity": "Keynote",
                      "status": "ACTIVE"
                    }
                    """.formatted(EVENT_ID, LocalDate.now().plusDays(1));

            mockMvc.perform(put("/events/{eventId}/schedules/{id}", EVENT_ID, SCHED_ID)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(invalidBody))
                    .andExpect(status().isBadRequest());
        }
    }

    // -------------------------------------------------------------------------
    // DELETE /events/{eventId}/schedules/{id}
    // -------------------------------------------------------------------------
    @Nested
    @DisplayName("DELETE /events/{eventId}/schedules/{id}")
    class DeleteSchedule {

        @Test
        @DisplayName("happy path – returns 204 NO_CONTENT on successful deletion")
        void delete_happyPath() throws Exception {
            when(scheduleService.deleteById(SCHED_ID)).thenReturn(true);

            mockMvc.perform(delete("/events/{eventId}/schedules/{id}", EVENT_ID, SCHED_ID))
                    .andExpect(status().isNoContent());

            verify(scheduleService).deleteById(SCHED_ID);
        }

        @Test
        @DisplayName("unhappy path – returns 404 when schedule does not exist")
        void delete_notFound() throws Exception {
            when(scheduleService.deleteById(SCHED_ID))
                    .thenThrow(new ScheduleNotFoundException(SCHED_ID));

            mockMvc.perform(delete("/events/{eventId}/schedules/{id}", EVENT_ID, SCHED_ID))
                    .andExpect(status().isNotFound());
        }
    }
}
