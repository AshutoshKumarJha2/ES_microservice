package com.eventsphere.engagement_manager;


import com.eventsphere.engagement_manager.controller.EngagementController;
import com.eventsphere.engagement_manager.dto.engagement.EngagementRequestDto;
import com.eventsphere.engagement_manager.dto.engagement.EngagementResponseDto;
import com.eventsphere.engagement_manager.model.data.EngagementType;
import com.eventsphere.engagement_manager.service.EngagementService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(EngagementController.class)
class EngagementControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private EngagementService engagementService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @WithMockUser(roles = "ATTENDEE")
    @DisplayName("POST /engagements/log - Success")
    void logEngagement_ShouldReturnCreated() throws Exception {
        EngagementRequestDto request = new EngagementRequestDto("user123", "event456", EngagementType.CLICK);
        EngagementResponseDto response = new EngagementResponseDto("eng-001", "user123", "event456", EngagementType.CLICK);

        when(engagementService.recordEngagement(any(EngagementRequestDto.class))).thenReturn(response);

        mockMvc.perform(post("/engagements/log")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value("eng-001"))
                .andExpect(jsonPath("$.attendeeId").value("user123"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("GET /engagements/event/{id} - Success")
    void getByEvent_ShouldReturnList() throws Exception {
        String eventId = "event456";
        when(engagementService.getByEvent(eventId)).thenReturn(List.of(new EngagementResponseDto("eng-1", "u1", eventId, EngagementType.VIEW)));

        mockMvc.perform(get("/engagements/event/{eventId}/log", eventId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }
}