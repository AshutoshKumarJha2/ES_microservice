package com.eventsphere.engagement_manager.dto.mapper;

import com.eventsphere.engagement_manager.dto.engagement.EngagementRequestDto;
import com.eventsphere.engagement_manager.dto.engagement.EngagementResponseDto;
import com.eventsphere.engagement_manager.dto.feedback.FeedbackRequestDto;
import com.eventsphere.engagement_manager.dto.feedback.FeedbackResponseDto;
import com.eventsphere.engagement_manager.dto.mapper.engagement.EngagementRequestDtoMapper;
import com.eventsphere.engagement_manager.dto.mapper.engagement.EngagementResponseDtoMapper;
import com.eventsphere.engagement_manager.dto.mapper.feedback.FeedbackRequestDtoMapper;
import com.eventsphere.engagement_manager.dto.mapper.feedback.FeedbackResponseDtoMapper;
import com.eventsphere.engagement_manager.model.Engagement;
import com.eventsphere.engagement_manager.model.Feedback;
import com.eventsphere.engagement_manager.model.data.EngagementType;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

class MapperTest {

    // =========================================================================
    // EngagementRequestDtoMapper
    // =========================================================================
    @Nested
    @DisplayName("EngagementRequestDtoMapper.toEntity")
    class EngagementRequestDtoMapperTests {

        @Test
        @DisplayName("null input – returns null")
        void toEntity_null_returnsNull() {
            assertThat(EngagementRequestDtoMapper.toEntity(null)).isNull();
        }

        @Test
        @DisplayName("maps eventId, attendeeId, and activity to Engagement entity")
        void toEntity_mapsAllFields() {
            EngagementRequestDto dto = EngagementRequestDto.builder()
                    .eventId("event-001")
                    .attendeeId("attendee-001")
                    .activity(EngagementType.SESSION_JOIN)
                    .activityTimestamp(LocalDateTime.now().minusMinutes(5))
                    .build();

            Engagement entity = EngagementRequestDtoMapper.toEntity(dto);

            assertThat(entity.getEventId()).isEqualTo("event-001");
            assertThat(entity.getAttendeeId()).isEqualTo("attendee-001");
            assertThat(entity.getActivity()).isEqualTo(EngagementType.SESSION_JOIN);
        }

        @Test
        @DisplayName("maps CHECK_IN activity type correctly")
        void toEntity_checkInActivity_mapsCorrectly() {
            EngagementRequestDto dto = EngagementRequestDto.builder()
                    .eventId("event-002")
                    .attendeeId("attendee-002")
                    .activity(EngagementType.CHECK_IN)
                    .build();

            Engagement entity = EngagementRequestDtoMapper.toEntity(dto);

            assertThat(entity.getActivity()).isEqualTo(EngagementType.CHECK_IN);
        }
    }

    // =========================================================================
    // EngagementResponseDtoMapper
    // =========================================================================
    @Nested
    @DisplayName("EngagementResponseDtoMapper.toDTO")
    class EngagementResponseDtoMapperTests {

        @Test
        @DisplayName("null input – returns null")
        void toDTO_null_returnsNull() {
            assertThat(EngagementResponseDtoMapper.toDTO(null)).isNull();
        }

        @Test
        @DisplayName("maps all fields from Engagement entity to EngagementResponseDto")
        void toDTO_mapsAllFields() {
            Engagement entity = Engagement.builder()
                    .engagementId("eng-001")
                    .eventId("event-001")
                    .attendeeId("attendee-001")
                    .activity(EngagementType.POLL_VOTE)
                    .build();

            EngagementResponseDto dto = EngagementResponseDtoMapper.toDTO(entity);

            assertThat(dto.engagementId()).isEqualTo("eng-001");
            assertThat(dto.eventId()).isEqualTo("event-001");
            assertThat(dto.attendeeId()).isEqualTo("attendee-001");
            assertThat(dto.activity()).isEqualTo(EngagementType.POLL_VOTE);
        }
    }

    // =========================================================================
    // FeedbackRequestDtoMapper
    // =========================================================================
    @Nested
    @DisplayName("FeedbackRequestDtoMapper.toEntity")
    class FeedbackRequestDtoMapperTests {

        @Test
        @DisplayName("null input – returns null")
        void toEntity_null_returnsNull() {
            assertThat(FeedbackRequestDtoMapper.toEntity(null)).isNull();
        }

        @Test
        @DisplayName("maps all fields from FeedbackRequestDto to Feedback entity")
        void toEntity_mapsAllFields() {
            LocalDateTime createdAt = LocalDateTime.now().minusMinutes(10);
            FeedbackRequestDto dto = FeedbackRequestDto.builder()
                    .eventId("event-001")
                    .attendeeId("attendee-001")
                    .rating(5)
                    .comments("Excellent event!")
                    .createdAt(createdAt)
                    .build();

            Feedback entity = FeedbackRequestDtoMapper.toEntity(dto);

            assertThat(entity.getEventId()).isEqualTo("event-001");
            assertThat(entity.getAttendeeId()).isEqualTo("attendee-001");
            assertThat(entity.getRating()).isEqualTo(5);
            assertThat(entity.getComments()).isEqualTo("Excellent event!");
            assertThat(entity.getCreatedAt()).isEqualTo(createdAt);
        }

        @Test
        @DisplayName("maps null comments correctly")
        void toEntity_nullComments_mapsCorrectly() {
            FeedbackRequestDto dto = FeedbackRequestDto.builder()
                    .eventId("event-001")
                    .attendeeId("attendee-001")
                    .rating(3)
                    .comments(null)
                    .createdAt(LocalDateTime.now().minusMinutes(1))
                    .build();

            Feedback entity = FeedbackRequestDtoMapper.toEntity(dto);

            assertThat(entity.getComments()).isNull();
        }
    }

    // =========================================================================
    // FeedbackResponseDtoMapper
    // =========================================================================
    @Nested
    @DisplayName("FeedbackResponseDtoMapper.toDTO")
    class FeedbackResponseDtoMapperTests {

        @Test
        @DisplayName("null input – returns null")
        void toDTO_null_returnsNull() {
            assertThat(FeedbackResponseDtoMapper.toDTO(null)).isNull();
        }

        @Test
        @DisplayName("maps all fields from Feedback entity to FeedbackResponseDto")
        void toDTO_mapsAllFields() {
            LocalDateTime createdAt = LocalDateTime.now().minusMinutes(10);
            Feedback entity = Feedback.builder()
                    .feedbackId("fb-001")
                    .eventId("event-001")
                    .attendeeId("attendee-001")
                    .rating(3)
                    .comments("Good event")
                    .createdAt(createdAt)
                    .build();

            FeedbackResponseDto dto = FeedbackResponseDtoMapper.toDTO(entity);

            assertThat(dto.feedbackId()).isEqualTo("fb-001");
            assertThat(dto.eventId()).isEqualTo("event-001");
            assertThat(dto.attendeeId()).isEqualTo("attendee-001");
            assertThat(dto.rating()).isEqualTo(3);
            assertThat(dto.comments()).isEqualTo("Good event");
            assertThat(dto.createdAt()).isEqualTo(createdAt);
        }

        @Test
        @DisplayName("maps null createdAt from entity correctly")
        void toDTO_nullCreatedAt_mapsCorrectly() {
            Feedback entity = Feedback.builder()
                    .feedbackId("fb-002")
                    .eventId("event-002")
                    .attendeeId("attendee-002")
                    .rating(2)
                    .createdAt(null)
                    .build();

            FeedbackResponseDto dto = FeedbackResponseDtoMapper.toDTO(entity);

            assertThat(dto.feedbackId()).isEqualTo("fb-002");
            assertThat(dto.createdAt()).isNull();
        }
    }
}
