package com.cts.eventsphere.logmanager.controller;

import com.cts.eventsphere.logmanager.exception.GlobalExceptionHandler;
import com.cts.eventsphere.logmanager.model.Notification;
import com.cts.eventsphere.logmanager.service.NotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDateTime;
import java.util.List;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class NotificationControllerTest {

    @Mock private NotificationService notificationService;
    @InjectMocks private NotificationController notificationController;

    private MockMvc mockMvc;

    private static final String USER_ID         = "user-001";
    private static final String NOTIFICATION_ID = "notif-001";

    private Notification sampleNotification;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .standaloneSetup(notificationController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();

        sampleNotification = Notification.builder()
                .notificationId(NOTIFICATION_ID)
                .userId(USER_ID)
                .message("Your registration was confirmed")
                .category("TICKET")
                .status("Unread")
                .createdAt(LocalDateTime.now().minusMinutes(10))
                .build();
    }

    // -------------------------------------------------------------------------
    // GET /notifications/{userId}/scroll
    // -------------------------------------------------------------------------
    @Nested
    @DisplayName("GET /notifications/{userId}/scroll")
    class GetNotificationsScroll {

        @Test
        @DisplayName("happy path – returns 200 with list of notifications")
        void getScroll_happyPath_returns200() throws Exception {
            when(notificationService.getNotificationsScroll(eq(USER_ID), isNull(), eq(20)))
                    .thenReturn(List.of(sampleNotification));

            mockMvc.perform(get("/notifications/{userId}/scroll", USER_ID)
                            .param("limit", "20"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(1)))
                    .andExpect(jsonPath("$[0].notificationId").value(NOTIFICATION_ID))
                    .andExpect(jsonPath("$[0].message").value("Your registration was confirmed"));
        }

        @Test
        @DisplayName("happy path – returns 200 with empty list when no notifications exist")
        void getScroll_empty_returns200WithEmptyList() throws Exception {
            when(notificationService.getNotificationsScroll(eq(USER_ID), isNull(), eq(20)))
                    .thenReturn(List.of());

            mockMvc.perform(get("/notifications/{userId}/scroll", USER_ID)
                            .param("limit", "20"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(0)));
        }

        @Test
        @DisplayName("passes lastTimestamp parameter to service when provided")
        void getScroll_withTimestamp_passesTimestampToService() throws Exception {
            String timestamp = "2026-03-30T10:00:00";
            when(notificationService.getNotificationsScroll(eq(USER_ID), any(LocalDateTime.class), eq(10)))
                    .thenReturn(List.of(sampleNotification));

            mockMvc.perform(get("/notifications/{userId}/scroll", USER_ID)
                            .param("lastTimestamp", timestamp)
                            .param("limit", "10"))
                    .andExpect(status().isOk());

            verify(notificationService).getNotificationsScroll(eq(USER_ID), any(LocalDateTime.class), eq(10));
        }

        @Test
        @DisplayName("uses default limit of 20 when not specified")
        void getScroll_defaultLimit_usesDefault() throws Exception {
            when(notificationService.getNotificationsScroll(eq(USER_ID), isNull(), eq(20)))
                    .thenReturn(List.of());

            mockMvc.perform(get("/notifications/{userId}/scroll", USER_ID))
                    .andExpect(status().isOk());

            verify(notificationService).getNotificationsScroll(USER_ID, null, 20);
        }
    }

    // -------------------------------------------------------------------------
    // POST /notifications/send
    // -------------------------------------------------------------------------
    @Nested
    @DisplayName("POST /notifications/send")
    class SendNotification {

        @Test
        @DisplayName("happy path – returns 201 NO_CONTENT on successful send")
        void sendNotification_happyPath_returns201() throws Exception {
            doNothing().when(notificationService).sendNotification(USER_ID, "Hello", "INFO");

            mockMvc.perform(post("/notifications/send")
                            .param("userId", USER_ID)
                            .param("message", "Hello")
                            .param("category", "INFO"))
                    .andExpect(status().isCreated());

            verify(notificationService).sendNotification(USER_ID, "Hello", "INFO");
        }

        @Test
        @DisplayName("passes category correctly to service")
        void sendNotification_differentCategory_passedCorrectly() throws Exception {
            doNothing().when(notificationService).sendNotification(USER_ID, "Ticket confirmed", "TICKET");

            mockMvc.perform(post("/notifications/send")
                            .param("userId", USER_ID)
                            .param("message", "Ticket confirmed")
                            .param("category", "TICKET"))
                    .andExpect(status().isCreated());
        }
    }

    // -------------------------------------------------------------------------
    // PATCH /notifications/{notificationId}/read
    // -------------------------------------------------------------------------
    @Nested
    @DisplayName("PATCH /notifications/{notificationId}/read")
    class MarkAsRead {

        @Test
        @DisplayName("happy path – returns 204 NO_CONTENT on successful mark-as-read")
        void markAsRead_happyPath_returns204() throws Exception {
            doNothing().when(notificationService).markAsRead(NOTIFICATION_ID);

            mockMvc.perform(patch("/notifications/{notificationId}/read", NOTIFICATION_ID))
                    .andExpect(status().isNoContent());

            verify(notificationService).markAsRead(NOTIFICATION_ID);
        }

        @Test
        @DisplayName("returns 204 even when notification does not exist (service handles silently)")
        void markAsRead_notFound_returns204() throws Exception {
            doNothing().when(notificationService).markAsRead("unknown-id");

            mockMvc.perform(patch("/notifications/{notificationId}/read", "unknown-id"))
                    .andExpect(status().isNoContent());
        }
    }
}
