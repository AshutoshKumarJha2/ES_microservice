package com.cts.eventsphere.eventmanager.dto.mapper;

import com.cts.eventsphere.eventmanager.dto.event.EventRequestDto;
import com.cts.eventsphere.eventmanager.dto.event.EventResponseDto;
import com.cts.eventsphere.eventmanager.dto.mapper.event.EventRequestDtoMapper;
import com.cts.eventsphere.eventmanager.dto.mapper.event.EventResponseDtoMapper;
import com.cts.eventsphere.eventmanager.dto.mapper.registration.RegistrationDtoMapper;
import com.cts.eventsphere.eventmanager.dto.mapper.schedule.ScheduleRequestDtoMapper;
import com.cts.eventsphere.eventmanager.dto.mapper.schedule.ScheduleResponseDtoMapper;
import com.cts.eventsphere.eventmanager.dto.mapper.ticket.TicketDtoMapper;
import com.cts.eventsphere.eventmanager.dto.registration.RegistrationDto;
import com.cts.eventsphere.eventmanager.dto.schedule.ScheduleRequestDto;
import com.cts.eventsphere.eventmanager.dto.schedule.ScheduleResponseDto;
import com.cts.eventsphere.eventmanager.dto.ticket.TicketResponseDto;
import com.cts.eventsphere.eventmanager.model.Event;
import com.cts.eventsphere.eventmanager.model.Registration;
import com.cts.eventsphere.eventmanager.model.Schedule;
import com.cts.eventsphere.eventmanager.model.Ticket;
import com.cts.eventsphere.eventmanager.model.data.EventStatus;
import com.cts.eventsphere.eventmanager.model.data.RegistrationStatus;
import com.cts.eventsphere.eventmanager.model.data.ScheduleStatus;
import com.cts.eventsphere.eventmanager.model.data.TicketStatus;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

class MapperTest {

    // =========================================================================
    // EventRequestDtoMapper
    // =========================================================================
    @Nested
    @DisplayName("EventRequestDtoMapper")
    class EventRequestDtoMapperTests {

        private final EventRequestDtoMapper mapper = new EventRequestDtoMapper();

        @Test
        @DisplayName("returns null when dto is null")
        void toEntity_nullDto_returnsNull() {
            assertThat(mapper.toEntity(null)).isNull();
        }

        @Test
        @DisplayName("maps all fields correctly when dto has explicit status")
        void toEntity_nonNull_mapsFields() {
            EventRequestDto dto = EventRequestDto.builder()
                    .name("Tech Summit")
                    .organizerId("org-001")
                    .startDate(LocalDate.now().plusDays(1))
                    .endDate(LocalDate.now().plusDays(5))
                    .venueId("venue-001")
                    .status(EventStatus.published)
                    .build();

            Event event = mapper.toEntity(dto);

            assertThat(event.getName()).isEqualTo("Tech Summit");
            assertThat(event.getOrganizerId()).isEqualTo("org-001");
            assertThat(event.getVenueId()).isEqualTo("venue-001");
            assertThat(event.getStatus()).isEqualTo(EventStatus.published);
        }

        @Test
        @DisplayName("defaults status to EventStatus.draft when dto.status() is null")
        void toEntity_nullStatus_defaultsDraft() {
            EventRequestDto dto = EventRequestDto.builder()
                    .name("Draft Event")
                    .organizerId("org-001")
                    .startDate(LocalDate.now().plusDays(1))
                    .endDate(LocalDate.now().plusDays(3))
                    .build();

            Event event = mapper.toEntity(dto);

            assertThat(event.getStatus()).isEqualTo(EventStatus.draft);
        }
    }

    // =========================================================================
    // EventResponseDtoMapper
    // =========================================================================
    @Nested
    @DisplayName("EventResponseDtoMapper")
    class EventResponseDtoMapperTests {

        private final EventResponseDtoMapper mapper = new EventResponseDtoMapper();

        @Test
        @DisplayName("maps Event entity to EventResponseDto correctly")
        void toDTO_mapsAllFields() {
            Event event = Event.builder()
                    .eventId("event-001")
                    .name("Tech Summit")
                    .organizerId("org-001")
                    .startDate(LocalDate.of(2026, 5, 1))
                    .endDate(LocalDate.of(2026, 5, 5))
                    .status(EventStatus.published)
                    .venueId("venue-001")
                    .build();

            EventResponseDto dto = mapper.toDTO(event);

            assertThat(dto.id()).isEqualTo("event-001");
            assertThat(dto.eventName()).isEqualTo("Tech Summit");
            assertThat(dto.organizerId()).isEqualTo("org-001");
            assertThat(dto.startAt()).isEqualTo("2026-05-01");
            assertThat(dto.endAt()).isEqualTo("2026-05-05");
            assertThat(dto.status()).isEqualTo(EventStatus.published);
            assertThat(dto.venueId()).isEqualTo("venue-001");
        }

        @Test
        @DisplayName("returns null for startAt and endAt when event dates are null")
        void toDTO_nullDates_returnsNullStrings() {
            Event event = Event.builder()
                    .eventId("event-002")
                    .name("No Date Event")
                    .organizerId("org-001")
                    .build();

            EventResponseDto dto = mapper.toDTO(event);

            assertThat(dto.startAt()).isNull();
            assertThat(dto.endAt()).isNull();
        }
    }

    // =========================================================================
    // ScheduleRequestDtoMapper
    // =========================================================================
    @Nested
    @DisplayName("ScheduleRequestDtoMapper")
    class ScheduleRequestDtoMapperTests {

        private final ScheduleRequestDtoMapper mapper = new ScheduleRequestDtoMapper();

        @Test
        @DisplayName("returns null when dto is null")
        void toEntity_nullDto_returnsNull() {
            Event event = Event.builder().eventId("event-001").build();
            assertThat(mapper.toEntity(null, event)).isNull();
        }

        @Test
        @DisplayName("maps ScheduleRequestDto and Event to Schedule entity")
        void toEntity_nonNull_mapsFields() {
            Event event = Event.builder().eventId("event-001").build();
            ScheduleRequestDto dto = ScheduleRequestDto.builder()
                    .date(LocalDate.of(2026, 5, 2))
                    .timeSlot("09:00-10:00")
                    .activity("Keynote")
                    .status(ScheduleStatus.active)
                    .build();

            Schedule schedule = mapper.toEntity(dto, event);

            assertThat(schedule.getEvent()).isEqualTo(event);
            assertThat(schedule.getTimeSlot()).isEqualTo("09:00-10:00");
            assertThat(schedule.getActivity()).isEqualTo("Keynote");
            assertThat(schedule.getStatus()).isEqualTo(ScheduleStatus.active);
        }
    }

    // =========================================================================
    // ScheduleResponseDtoMapper
    // =========================================================================
    @Nested
    @DisplayName("ScheduleResponseDtoMapper")
    class ScheduleResponseDtoMapperTests {

        private final ScheduleResponseDtoMapper mapper = new ScheduleResponseDtoMapper();

        @Test
        @DisplayName("maps Schedule entity to ScheduleResponseDto correctly")
        void toDTO_mapsAllFields() {
            Event event = Event.builder().eventId("event-001").build();
            Schedule schedule = Schedule.builder()
                    .scheduleId("sched-001")
                    .event(event)
                    .date(LocalDate.of(2026, 5, 2))
                    .timeSlot("09:00-10:00")
                    .activity("Workshop")
                    .status(ScheduleStatus.active)
                    .build();

            ScheduleResponseDto dto = mapper.toDTO(schedule);

            assertThat(dto.scheduleId()).isEqualTo("sched-001");
            assertThat(dto.eventId()).isEqualTo("event-001");
            assertThat(dto.date()).isEqualTo("2026-05-02");
            assertThat(dto.timeSlot()).isEqualTo("09:00-10:00");
            assertThat(dto.activity()).isEqualTo("Workshop");
            assertThat(dto.status()).isEqualTo(ScheduleStatus.active);
        }

        @Test
        @DisplayName("returns null for date when schedule date is null")
        void toDTO_nullDate_returnsNullString() {
            Event event = Event.builder().eventId("event-001").build();
            Schedule schedule = Schedule.builder()
                    .scheduleId("sched-002")
                    .event(event)
                    .timeSlot("10:00-11:00")
                    .activity("Panel")
                    .status(ScheduleStatus.draft)
                    .build();

            ScheduleResponseDto dto = mapper.toDTO(schedule);

            assertThat(dto.date()).isNull();
        }
    }

    // =========================================================================
    // TicketDtoMapper
    // =========================================================================
    @Nested
    @DisplayName("TicketDtoMapper")
    class TicketDtoMapperTests {

        @Test
        @DisplayName("maps Ticket entity to TicketResponseDto correctly")
        void toDto_mapsAllFields() {
            Event event = Event.builder().eventId("event-001").build();
            Ticket ticket = Ticket.builder()
                    .ticketId("ticket-001")
                    .event(event)
                    .type("vip")
                    .price(BigDecimal.valueOf(150.00))
                    .status(TicketStatus.ACTIVE)
                    .build();

            TicketResponseDto dto = TicketDtoMapper.toDto(ticket);

            assertThat(dto.ticketId()).isEqualTo("ticket-001");
            assertThat(dto.eventId()).isEqualTo("event-001");
            assertThat(dto.type()).isEqualTo("vip");
            assertThat(dto.price()).isEqualTo(150.00);
            assertThat(dto.status()).isEqualTo(TicketStatus.ACTIVE);
        }
    }

    // =========================================================================
    // RegistrationDtoMapper
    // =========================================================================
    @Nested
    @DisplayName("RegistrationDtoMapper")
    class RegistrationDtoMapperTests {

        @Test
        @DisplayName("maps Registration entity to RegistrationDto correctly")
        void toDto_mapsAllFields() {
            Event event = Event.builder().eventId("event-001").build();
            Ticket ticket = Ticket.builder().ticketId("ticket-001").build();
            Registration registration = Registration.builder()
                    .registrationId("reg-001")
                    .event(event)
                    .ticket(ticket)
                    .attendeeId("user-001")
                    .status(RegistrationStatus.PENDING)
                    .build();

            RegistrationDto dto = RegistrationDtoMapper.toDto(registration);

            assertThat(dto.registrationId()).isEqualTo("reg-001");
            assertThat(dto.eventId()).isEqualTo("event-001");
            assertThat(dto.ticketId()).isEqualTo("ticket-001");
            assertThat(dto.attendeeId()).isEqualTo("user-001");
            assertThat(dto.status()).isEqualTo("PENDING");
        }
    }
}
