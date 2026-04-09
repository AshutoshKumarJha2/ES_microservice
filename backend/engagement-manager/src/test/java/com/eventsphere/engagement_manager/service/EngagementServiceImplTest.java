package com.eventsphere.engagement_manager.service;

import com.eventsphere.engagement_manager.Exception.EngagementNotFoundException;
import com.eventsphere.engagement_manager.Exception.InvalidEngagementException;
import com.eventsphere.engagement_manager.client.LogServiceClient;
import com.eventsphere.engagement_manager.dto.engagement.EngagementRequestDto;
import com.eventsphere.engagement_manager.dto.engagement.EngagementResponseDto;
import com.eventsphere.engagement_manager.model.Engagement;
import com.eventsphere.engagement_manager.model.data.EngagementType;
import com.eventsphere.engagement_manager.repository.EngagementRepository;
import com.eventsphere.engagement_manager.service.AuditService;
import com.eventsphere.engagement_manager.service.impl.EngagementServiceImpl;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EngagementServiceImplTest {

    @Mock private EngagementRepository engagementRepository;
    @Mock private AuditService auditService;
    @Mock private LogServiceClient logServiceClient;
    @InjectMocks private EngagementServiceImpl engagementService;

    private static final String EVENT_ID    = "event-001";
    private static final String ATTENDEE_ID = "attendee-001";
    private static final String ENG_ID      = "eng-001";

    private Engagement sampleEngagement;

    @BeforeEach
    void setUp() {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("test-user", null));

        sampleEngagement = Engagement.builder()
                .engagementId(ENG_ID)
                .eventId(EVENT_ID)
                .attendeeId(ATTENDEE_ID)
                .activity(EngagementType.SESSION_JOIN)
                .createdAt(LocalDateTime.now().minusMinutes(5))
                .build();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    // -------------------------------------------------------------------------
    // recordEngagement
    // -------------------------------------------------------------------------
    @Nested
    @DisplayName("recordEngagement(requestDto)")
    class RecordEngagement {

        @Test
        @DisplayName("happy path – saves and returns mapped EngagementResponseDto")
        void recordEngagement_happyPath() {
            EngagementRequestDto dto = EngagementRequestDto.builder()
                    .eventId(EVENT_ID)
                    .attendeeId(ATTENDEE_ID)
                    .activity(EngagementType.SESSION_JOIN)
                    .activityTimestamp(LocalDateTime.now().minusMinutes(1))
                    .build();

            when(engagementRepository.save(any(Engagement.class))).thenReturn(sampleEngagement);

            EngagementResponseDto result = engagementService.recordEngagement(dto);

            assertThat(result.engagementId()).isEqualTo(ENG_ID);
            assertThat(result.eventId()).isEqualTo(EVENT_ID);
            assertThat(result.activity()).isEqualTo(EngagementType.SESSION_JOIN);
            verify(engagementRepository).save(any(Engagement.class));
        }

        @Test
        @DisplayName("null activityTimestamp – saves without timestamp validation")
        void recordEngagement_nullTimestamp_saves() {
            EngagementRequestDto dto = EngagementRequestDto.builder()
                    .eventId(EVENT_ID)
                    .attendeeId(ATTENDEE_ID)
                    .activity(EngagementType.CHECK_IN)
                    .activityTimestamp(null)
                    .build();

            when(engagementRepository.save(any(Engagement.class))).thenReturn(sampleEngagement);

            EngagementResponseDto result = engagementService.recordEngagement(dto);

            assertThat(result).isNotNull();
        }

        @Test
        @DisplayName("unhappy path – throws InvalidEngagementException when timestamp is in the future")
        void recordEngagement_futureTimestamp_throwsInvalidEngagement() {
            EngagementRequestDto dto = EngagementRequestDto.builder()
                    .eventId(EVENT_ID)
                    .attendeeId(ATTENDEE_ID)
                    .activity(EngagementType.SESSION_JOIN)
                    .activityTimestamp(LocalDateTime.now().plusHours(1))
                    .build();

            assertThatThrownBy(() -> engagementService.recordEngagement(dto))
                    .isInstanceOf(InvalidEngagementException.class)
                    .hasMessageContaining("future");

            verify(engagementRepository, never()).save(any());
        }
    }

    // -------------------------------------------------------------------------
    // getByEvent
    // -------------------------------------------------------------------------
    @Nested
    @DisplayName("getByEvent(eventId)")
    class GetByEvent {

        @Test
        @DisplayName("happy path – returns list of EngagementResponseDto for event")
        void getByEvent_happyPath_returnsList() {
            when(engagementRepository.findByEventId(EVENT_ID)).thenReturn(List.of(sampleEngagement));

            List<EngagementResponseDto> result = engagementService.getByEvent(EVENT_ID);

            assertThat(result).hasSize(1);
            assertThat(result.get(0).engagementId()).isEqualTo(ENG_ID);
        }

        @Test
        @DisplayName("unhappy path – throws EngagementNotFoundException when no engagements found")
        void getByEvent_empty_throwsNotFound() {
            when(engagementRepository.findByEventId(EVENT_ID)).thenReturn(List.of());

            assertThatThrownBy(() -> engagementService.getByEvent(EVENT_ID))
                    .isInstanceOf(EngagementNotFoundException.class)
                    .hasMessageContaining(EVENT_ID);
        }
    }

    // -------------------------------------------------------------------------
    // getByActivityType
    // -------------------------------------------------------------------------
    @Nested
    @DisplayName("getByActivityType(activity)")
    class GetByActivityType {

        @Test
        @DisplayName("happy path – returns list of engagements for given activity type")
        void getByActivityType_happyPath_returnsList() {
            when(engagementRepository.findByActivity(EngagementType.SESSION_JOIN))
                    .thenReturn(List.of(sampleEngagement));

            List<EngagementResponseDto> result = engagementService.getByActivityType(EngagementType.SESSION_JOIN);

            assertThat(result).hasSize(1);
            assertThat(result.get(0).activity()).isEqualTo(EngagementType.SESSION_JOIN);
        }

        @Test
        @DisplayName("unhappy path – throws EngagementNotFoundException when no engagements found")
        void getByActivityType_empty_throwsNotFound() {
            when(engagementRepository.findByActivity(EngagementType.POLL_VOTE)).thenReturn(List.of());

            assertThatThrownBy(() -> engagementService.getByActivityType(EngagementType.POLL_VOTE))
                    .isInstanceOf(EngagementNotFoundException.class)
                    .hasMessageContaining("POLL_VOTE");
        }
    }

    // -------------------------------------------------------------------------
    // getFilteredEngagements
    // -------------------------------------------------------------------------
    @Nested
    @DisplayName("getFilteredEngagements(eventId, activity, start, end)")
    class GetFilteredEngagements {

        private final LocalDateTime start = LocalDateTime.now().minusHours(2);
        private final LocalDateTime end   = LocalDateTime.now();

        @Test
        @DisplayName("happy path – returns filtered list")
        void getFiltered_happyPath_returnsList() {
            when(engagementRepository.findByEventIdAndActivityAndCreatedAtBetween(
                    EVENT_ID, EngagementType.SESSION_JOIN, start, end))
                    .thenReturn(List.of(sampleEngagement));

            List<EngagementResponseDto> result =
                    engagementService.getFilteredEngagements(EVENT_ID, EngagementType.SESSION_JOIN, start, end);

            assertThat(result).hasSize(1);
        }

        @Test
        @DisplayName("unhappy path – throws InvalidEngagementException when start is after end")
        void getFiltered_startAfterEnd_throwsInvalidEngagement() {
            LocalDateTime badStart = LocalDateTime.now();
            LocalDateTime badEnd   = LocalDateTime.now().minusHours(1);

            assertThatThrownBy(() ->
                    engagementService.getFilteredEngagements(EVENT_ID, EngagementType.SESSION_JOIN, badStart, badEnd))
                    .isInstanceOf(InvalidEngagementException.class)
                    .hasMessageContaining("Start date");

            verify(engagementRepository, never()).findByEventIdAndActivityAndCreatedAtBetween(any(), any(), any(), any());
        }

        @Test
        @DisplayName("unhappy path – throws EngagementNotFoundException when no results match filters")
        void getFiltered_noResults_throwsNotFound() {
            when(engagementRepository.findByEventIdAndActivityAndCreatedAtBetween(
                    EVENT_ID, EngagementType.BOOTH_VISIT, start, end))
                    .thenReturn(List.of());

            assertThatThrownBy(() ->
                    engagementService.getFilteredEngagements(EVENT_ID, EngagementType.BOOTH_VISIT, start, end))
                    .isInstanceOf(EngagementNotFoundException.class);
        }

        @Test
        @DisplayName("null start and end – skips date validation and queries repository")
        void getFiltered_nullDates_skipsValidation() {
            when(engagementRepository.findByEventIdAndActivityAndCreatedAtBetween(
                    EVENT_ID, EngagementType.SESSION_JOIN, null, null))
                    .thenReturn(List.of(sampleEngagement));

            List<EngagementResponseDto> result =
                    engagementService.getFilteredEngagements(EVENT_ID, EngagementType.SESSION_JOIN, null, null);

            assertThat(result).hasSize(1);
        }
    }
}
