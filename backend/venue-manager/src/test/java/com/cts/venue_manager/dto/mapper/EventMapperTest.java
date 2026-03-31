package com.cts.venue_manager.dto.mapper;

import com.cts.venue_manager.client.model.Event;
import com.cts.venue_manager.client.model.data.EventStatus;
import com.cts.venue_manager.dto.event.EventRequestDto;
import com.cts.venue_manager.dto.event.EventResponseDto;
import com.cts.venue_manager.dto.mapper.event.EventRequestDtoMapper;
import com.cts.venue_manager.dto.mapper.event.EventResponseDtoMapper;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

class EventMapperTest {

    private final EventResponseDtoMapper responseDtoMapper = new EventResponseDtoMapper();

    // ─── EventRequestDtoMapper ────────────────────────────────────────────────

    @Test
    void toEntity_nullInput_returnsNull() {
        assertThat(EventRequestDtoMapper.toEntity(null)).isNull();
    }

    @Test
    void toEntity_allFieldsMapped() {
        LocalDateTime start = LocalDateTime.of(2026, 6, 1, 10, 0);
        LocalDateTime end = LocalDateTime.of(2026, 6, 2, 18, 0);

        EventRequestDto dto = EventRequestDto.builder()
                .name("Tech Summit")
                .organizerId("org-1")
                .startDate(start)
                .endDate(end)
                .venueId("venue-1")
                .status(EventStatus.PUBLISHED)
                .build();

        Event entity = EventRequestDtoMapper.toEntity(dto);

        assertThat(entity).isNotNull();
        assertThat(entity.getName()).isEqualTo("Tech Summit");
        assertThat(entity.getOrganizerId()).isEqualTo("org-1");
        assertThat(entity.getStartDate()).isEqualTo(start);
        assertThat(entity.getEndDate()).isEqualTo(end);
        assertThat(entity.getVenueId()).isEqualTo("venue-1");
        assertThat(entity.getStatus()).isEqualTo(EventStatus.PUBLISHED);
    }

    @Test
    void toEntity_nullStatus_defaultsToDraft() {
        EventRequestDto dto = EventRequestDto.builder()
                .name("Draft Event")
                .organizerId("org-2")
                .venueId("venue-2")
                .status(null)
                .build();

        Event entity = EventRequestDtoMapper.toEntity(dto);

        assertThat(entity).isNotNull();
        assertThat(entity.getStatus()).isEqualTo(EventStatus.DRAFT);
    }

    // ─── EventResponseDtoMapper ───────────────────────────────────────────────

    @Test
    void toDTO_allFieldsMapped() {
        LocalDateTime start = LocalDateTime.of(2026, 7, 10, 9, 0);
        LocalDateTime end = LocalDateTime.of(2026, 7, 11, 17, 0);

        Event event = Event.builder()
                .eventId("event-999")
                .name("Annual Gala")
                .organizerId("org-3")
                .startDate(start)
                .endDate(end)
                .status(EventStatus.PUBLISHED)
                .venueId("venue-3")
                .build();

        EventResponseDto dto = responseDtoMapper.toDTO(event);

        assertThat(dto.id()).isEqualTo("event-999");
        assertThat(dto.eventName()).isEqualTo("Annual Gala");
        assertThat(dto.organizerId()).isEqualTo("org-3");
        assertThat(dto.startAt()).isEqualTo(start.toString());
        assertThat(dto.endAt()).isEqualTo(end.toString());
        assertThat(dto.status()).isEqualTo(EventStatus.PUBLISHED);
        assertThat(dto.venueId()).isEqualTo("venue-3");
    }

    @Test
    void toDTO_nullDates_producesNullStartAtAndEndAt() {
        Event event = Event.builder()
                .eventId("event-000")
                .name("TBD Event")
                .organizerId("org-4")
                .startDate(null)
                .endDate(null)
                .status(EventStatus.DRAFT)
                .venueId("venue-4")
                .build();

        EventResponseDto dto = responseDtoMapper.toDTO(event);

        assertThat(dto.startAt()).isNull();
        assertThat(dto.endAt()).isNull();
    }
}
