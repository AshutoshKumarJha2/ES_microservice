package com.cts.eventsphere.logmanager.service;

import com.cts.eventsphere.logmanager.model.Notification;
import com.cts.eventsphere.logmanager.model.data.NotificationStatus;
import com.cts.eventsphere.logmanager.repository.NotificationRepository;
import com.cts.eventsphere.logmanager.service.impl.NotificationServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceImplTest {

    @Mock private NotificationRepository notificationRepository;
    @Mock private EmailService emailService;
    @InjectMocks private NotificationServiceImpl notificationService;

    private static final String USER_ID           = "user-001";
    private static final String NOTIFICATION_ID   = "notif-001";

    private Notification sampleNotification;

    @BeforeEach
    void setUp() {
        sampleNotification = Notification.builder()
                .notificationId(NOTIFICATION_ID)
                .userId(USER_ID)
                .message("Your ticket was confirmed")
                .category("TICKET")
                .status("Unread")
                .createdAt(LocalDateTime.now().minusMinutes(5))
                .build();
    }

    // -------------------------------------------------------------------------
    // getNotificationsScroll
    // -------------------------------------------------------------------------
    @Nested
    @DisplayName("getNotificationsScroll(userId, lastTimestamp, limit)")
    class GetNotificationsScroll {

        @Test
        @DisplayName("happy path – returns list when explicit lastTimestamp is provided")
        void getNotificationsScroll_withTimestamp_returnsList() {
            LocalDateTime anchor = LocalDateTime.now().minusHours(1);
            when(notificationRepository.findTop20ByUserIdAndCreatedAtLessThanOrderByCreatedAtDesc(
                    USER_ID, anchor)).thenReturn(List.of(sampleNotification));

            List<Notification> result = notificationService.getNotificationsScroll(USER_ID, anchor, 20);

            assertThat(result).hasSize(1);
            assertThat(result.getFirst().getNotificationId()).isEqualTo(NOTIFICATION_ID);
        }

        @Test
        @DisplayName("null lastTimestamp – defaults to now and queries repository")
        void getNotificationsScroll_nullTimestamp_defaultsToNow() {
            when(notificationRepository.findTop20ByUserIdAndCreatedAtLessThanOrderByCreatedAtDesc(
                    eq(USER_ID), any(LocalDateTime.class)))
                    .thenReturn(List.of(sampleNotification));

            List<Notification> result = notificationService.getNotificationsScroll(USER_ID, null, 20);

            assertThat(result).hasSize(1);
            verify(notificationRepository).findTop20ByUserIdAndCreatedAtLessThanOrderByCreatedAtDesc(
                    eq(USER_ID), any(LocalDateTime.class));
        }

        @Test
        @DisplayName("returns empty list when no notifications match criteria")
        void getNotificationsScroll_noMatches_returnsEmpty() {
            when(notificationRepository.findTop20ByUserIdAndCreatedAtLessThanOrderByCreatedAtDesc(
                    eq(USER_ID), any(LocalDateTime.class))).thenReturn(List.of());

            List<Notification> result = notificationService.getNotificationsScroll(USER_ID, null, 20);

            assertThat(result).isEmpty();
        }
    }

    // -------------------------------------------------------------------------
    // sendNotification
    // -------------------------------------------------------------------------
    @Nested
    @DisplayName("sendNotification(userId, message, category)")
    class SendNotification {

        @Test
        @DisplayName("happy path – saves notification entity with correct fields")
        void sendNotification_happyPath_savesNotification() {
            when(notificationRepository.save(any(Notification.class))).thenReturn(sampleNotification);

            notificationService.sendNotification(USER_ID, "Your ticket was confirmed", "TICKET");

            verify(notificationRepository).save(argThat(n ->
                    USER_ID.equals(n.getUserId()) &&
                    "Your ticket was confirmed".equals(n.getMessage()) &&
                    "TICKET".equals(n.getCategory()) &&
                    "Unread".equals(n.getStatus())
            ));
        }

        @Test
        @DisplayName("does not interact with email service (email sending is commented out)")
        void sendNotification_doesNotCallEmailService() {
            when(notificationRepository.save(any(Notification.class))).thenReturn(sampleNotification);

            notificationService.sendNotification(USER_ID, "msg", "INFO");

            verifyNoInteractions(emailService);
        }
    }

    // -------------------------------------------------------------------------
    // markAsRead
    // -------------------------------------------------------------------------
    @Nested
    @DisplayName("markAsRead(notificationId)")
    class MarkAsRead {

        @Test
        @DisplayName("happy path – updates notification status to READ when notification exists")
        void markAsRead_found_setsStatusToRead() {
            when(notificationRepository.findById(NOTIFICATION_ID))
                    .thenReturn(Optional.of(sampleNotification));

            notificationService.markAsRead(NOTIFICATION_ID);

            assertThat(sampleNotification.getStatus())
                    .isEqualTo(NotificationStatus.READ.name());
        }

        @Test
        @DisplayName("silent no-op when notification is not found – logs warning only")
        void markAsRead_notFound_doesNotThrow() {
            when(notificationRepository.findById(NOTIFICATION_ID))
                    .thenReturn(Optional.empty());

            // must not throw
            notificationService.markAsRead(NOTIFICATION_ID);

            verify(notificationRepository).findById(NOTIFICATION_ID);
        }
    }
}
