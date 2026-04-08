package com.eventsphere.engagement_manager.service;

import com.eventsphere.engagement_manager.Exception.FeedbackNotFoundException;
import com.eventsphere.engagement_manager.client.EventServiceClient;
import com.eventsphere.engagement_manager.client.LogServiceClient;
import com.eventsphere.engagement_manager.dto.client.RegistrationStatusDto;
import com.eventsphere.engagement_manager.dto.feedback.FeedbackRequestDto;
import com.eventsphere.engagement_manager.dto.feedback.FeedbackResponseDto;
import com.eventsphere.engagement_manager.model.Feedback;
import com.eventsphere.engagement_manager.repository.FeedbackRepository;
import com.eventsphere.engagement_manager.service.AuditService;
import com.eventsphere.engagement_manager.service.impl.FeedbackServiceImpl;
import feign.FeignException;
import jakarta.persistence.EntityExistsException;
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
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FeedbackServiceImplTest {

    @Mock private FeedbackRepository feedbackRepository;
    @Mock private EventServiceClient registrationServiceClient;
    @Mock private AuditService auditService;
    @Mock private LogServiceClient logServiceClient;
    @InjectMocks private FeedbackServiceImpl feedbackService;

    private static final String EVENT_ID    = "event-001";
    private static final String ATTENDEE_ID = "attendee-001";
    private static final String FEEDBACK_ID = "feedback-001";

    private Feedback sampleFeedback;
    private FeedbackRequestDto validRequest;

    @BeforeEach
    void setUp() {
        sampleFeedback = Feedback.builder()
                .feedbackId(FEEDBACK_ID)
                .eventId(EVENT_ID)
                .attendeeId(ATTENDEE_ID)
                .rating(4)
                .comments("Great event!")
                .createdAt(LocalDateTime.now().minusMinutes(10))
                .build();

        validRequest = FeedbackRequestDto.builder()
                .eventId(EVENT_ID)
                .attendeeId(ATTENDEE_ID)
                .rating(4)
                .comments("Great event!")
                .createdAt(LocalDateTime.now().minusMinutes(10))
                .build();
    }

    // -------------------------------------------------------------------------
    // create
    // -------------------------------------------------------------------------
    @Nested
    @DisplayName("create(request)")
    class Create {

        @Test
        @DisplayName("happy path – confirmed attendee, no duplicate → saves and returns DTO")
        void create_happyPath_confirmedAttendee() {
            var registrationStatus = new RegistrationStatusDto(ATTENDEE_ID, EVENT_ID, "CONFIRMED");
            when(registrationServiceClient.getRegistrationStatus(EVENT_ID))
                    .thenReturn(registrationStatus);
            when(feedbackRepository.findByEventIdAndAttendeeId(eq(EVENT_ID), eq(ATTENDEE_ID), any(PageRequest.class)))
                    .thenReturn(Page.empty());
            when(feedbackRepository.save(any(Feedback.class))).thenReturn(sampleFeedback);

            FeedbackResponseDto result = feedbackService.create(validRequest, null);

            assertThat(result.feedbackId()).isEqualTo(FEEDBACK_ID);
            assertThat(result.rating()).isEqualTo(4);
            verify(feedbackRepository).save(any(Feedback.class));
        }

        @Test
        @DisplayName("happy path – checked-in attendee → saves successfully")
        void create_checkedInAttendee_saves() {
            var registrationStatus = new RegistrationStatusDto(ATTENDEE_ID, EVENT_ID, "CHECKED_IN");
            when(registrationServiceClient.getRegistrationStatus(EVENT_ID))
                    .thenReturn(registrationStatus);
            when(feedbackRepository.findByEventIdAndAttendeeId(eq(EVENT_ID), eq(ATTENDEE_ID), any(PageRequest.class)))
                    .thenReturn(Page.empty());
            when(feedbackRepository.save(any(Feedback.class))).thenReturn(sampleFeedback);

            FeedbackResponseDto result = feedbackService.create(validRequest, null);

            assertThat(result).isNotNull();
        }

        @Test
        @DisplayName("unhappy path – rating < 1 → throws IllegalArgumentException")
        void create_ratingTooLow_throwsIllegalArgument() {
            FeedbackRequestDto badRequest = FeedbackRequestDto.builder()
                    .eventId(EVENT_ID).attendeeId(ATTENDEE_ID).rating(0)
                    .comments("bad").createdAt(LocalDateTime.now().minusMinutes(1)).build();

            assertThatThrownBy(() -> feedbackService.create(badRequest, null))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Rating");
        }

        @Test
        @DisplayName("unhappy path – rating > 5 → throws IllegalArgumentException")
        void create_ratingTooHigh_throwsIllegalArgument() {
            FeedbackRequestDto badRequest = FeedbackRequestDto.builder()
                    .eventId(EVENT_ID).attendeeId(ATTENDEE_ID).rating(6)
                    .comments("bad").createdAt(LocalDateTime.now().minusMinutes(1)).build();

            assertThatThrownBy(() -> feedbackService.create(badRequest, null))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Rating");
        }

        @Test
        @DisplayName("unhappy path – attendee not registered (FeignException.NotFound) → throws IllegalStateException")
        void create_attendeeNotRegistered_throwsIllegalState() {
            FeignException.NotFound notFound = mock(FeignException.NotFound.class);
            when(registrationServiceClient.getRegistrationStatus(EVENT_ID))
                    .thenThrow(notFound);

            assertThatThrownBy(() -> feedbackService.create(validRequest, null))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("not registered");
        }

        @Test
        @DisplayName("unhappy path – attendee status not confirmed/checked_in → throws IllegalStateException")
        void create_pendingAttendee_throwsIllegalState() {
            var registrationStatus = new RegistrationStatusDto(ATTENDEE_ID, EVENT_ID, "PENDING");
            when(registrationServiceClient.getRegistrationStatus(EVENT_ID))
                    .thenReturn(registrationStatus);

            assertThatThrownBy(() -> feedbackService.create(validRequest, null))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("confirmed or checked-in");
        }

        @Test
        @DisplayName("unhappy path – duplicate feedback → throws EntityExistsException")
        void create_duplicateFeedback_throwsEntityExists() {
            var registrationStatus = new RegistrationStatusDto(ATTENDEE_ID, EVENT_ID, "CONFIRMED");
            when(registrationServiceClient.getRegistrationStatus(EVENT_ID))
                    .thenReturn(registrationStatus);

            Page<Feedback> nonEmpty = new PageImpl<>(List.of(sampleFeedback));
            when(feedbackRepository.findByEventIdAndAttendeeId(eq(EVENT_ID), eq(ATTENDEE_ID), any(PageRequest.class)))
                    .thenReturn(nonEmpty);

            assertThatThrownBy(() -> feedbackService.create(validRequest, null))
                    .isInstanceOf(EntityExistsException.class)
                    .hasMessageContaining("already submitted");
        }
    }

    // -------------------------------------------------------------------------
    // getById
    // -------------------------------------------------------------------------
    @Nested
    @DisplayName("getById(feedbackId)")
    class GetById {

        @Test
        @DisplayName("happy path – returns FeedbackResponseDto when found")
        void getById_found_returnsDto() {
            when(feedbackRepository.findById(FEEDBACK_ID)).thenReturn(Optional.of(sampleFeedback));

            FeedbackResponseDto result = feedbackService.getById(FEEDBACK_ID);

            assertThat(result.feedbackId()).isEqualTo(FEEDBACK_ID);
            assertThat(result.comments()).isEqualTo("Great event!");
        }

        @Test
        @DisplayName("unhappy path – throws FeedbackNotFoundException when not found")
        void getById_notFound_throwsException() {
            when(feedbackRepository.findById(FEEDBACK_ID)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> feedbackService.getById(FEEDBACK_ID))
                    .isInstanceOf(FeedbackNotFoundException.class)
                    .hasMessageContaining(FEEDBACK_ID);
        }
    }

    // -------------------------------------------------------------------------
    // listByEvent
    // -------------------------------------------------------------------------
    @Nested
    @DisplayName("listByEvent(eventId, pageable)")
    class ListByEvent {

        @Test
        @DisplayName("happy path – returns paginated FeedbackResponseDto")
        void listByEvent_returnsPaginatedResult() {
            Pageable pageable = PageRequest.of(0, 10);
            Page<Feedback> page = new PageImpl<>(List.of(sampleFeedback), pageable, 1);
            when(feedbackRepository.findByEventId(EVENT_ID, pageable)).thenReturn(page);

            Page<FeedbackResponseDto> result = feedbackService.listByEvent(EVENT_ID, pageable);

            assertThat(result.getContent()).hasSize(1);
            assertThat(result.getContent().get(0).feedbackId()).isEqualTo(FEEDBACK_ID);
        }

        @Test
        @DisplayName("returns empty page when no feedback exists for event")
        void listByEvent_empty_returnsEmptyPage() {
            Pageable pageable = PageRequest.of(0, 10);
            when(feedbackRepository.findByEventId(EVENT_ID, pageable)).thenReturn(Page.empty(pageable));

            Page<FeedbackResponseDto> result = feedbackService.listByEvent(EVENT_ID, pageable);

            assertThat(result.getContent()).isEmpty();
        }
    }

    // -------------------------------------------------------------------------
    // listByEventAndDateRange
    // -------------------------------------------------------------------------
    @Nested
    @DisplayName("listByEventAndDateRange(eventId, start, end, pageable)")
    class ListByEventAndDateRange {

        @Test
        @DisplayName("happy path – returns feedback within date range")
        void listByEventAndDateRange_returnsFiltered() {
            LocalDateTime start = LocalDateTime.now().minusDays(1);
            LocalDateTime end   = LocalDateTime.now();
            Pageable pageable   = PageRequest.of(0, 10);
            Page<Feedback> page = new PageImpl<>(List.of(sampleFeedback), pageable, 1);
            when(feedbackRepository.findByEventIdAndCreatedAtBetween(EVENT_ID, start, end, pageable))
                    .thenReturn(page);

            Page<FeedbackResponseDto> result =
                    feedbackService.listByEventAndDateRange(EVENT_ID, start, end, pageable);

            assertThat(result.getContent()).hasSize(1);
        }
    }

    // -------------------------------------------------------------------------
    // delete
    // -------------------------------------------------------------------------
    @Nested
    @DisplayName("delete(feedbackId)")
    class Delete {

        @Test
        @DisplayName("happy path – deletes feedback when found")
        void delete_happyPath() {
            when(feedbackRepository.findById(FEEDBACK_ID)).thenReturn(Optional.of(sampleFeedback));

            feedbackService.delete(FEEDBACK_ID);

            verify(feedbackRepository).deleteById(FEEDBACK_ID);
        }

        @Test
        @DisplayName("unhappy path – throws FeedbackNotFoundException when not found")
        void delete_notFound_throwsException() {
            when(feedbackRepository.findById(FEEDBACK_ID)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> feedbackService.delete(FEEDBACK_ID))
                    .isInstanceOf(FeedbackNotFoundException.class)
                    .hasMessageContaining(FEEDBACK_ID);

            verify(feedbackRepository, never()).deleteById(any());
        }
    }
}
