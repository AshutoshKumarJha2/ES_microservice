package com.cts.eventsphere.eventmanager.service;

import com.cts.eventsphere.eventmanager.dto.audit.AuditAction;
import com.cts.eventsphere.eventmanager.dto.event.EventRequestDto;
import com.cts.eventsphere.eventmanager.dto.event.EventResponseDto;
import com.cts.eventsphere.eventmanager.dto.mapper.event.EventRequestDtoMapper;
import com.cts.eventsphere.eventmanager.dto.mapper.event.EventResponseDtoMapper;
import com.cts.eventsphere.eventmanager.dto.mapper.schedule.ScheduleRequestDtoMapper;
import com.cts.eventsphere.eventmanager.dto.mapper.schedule.ScheduleResponseDtoMapper;
import com.cts.eventsphere.eventmanager.dto.schedule.ScheduleRequestDto;
import com.cts.eventsphere.eventmanager.dto.schedule.ScheduleResponseDto;
import com.cts.eventsphere.eventmanager.exception.event.EventNotFoundException;
import com.cts.eventsphere.eventmanager.model.Event;
import com.cts.eventsphere.eventmanager.model.Schedule;
import com.cts.eventsphere.eventmanager.model.data.EventStatus;
import com.cts.eventsphere.eventmanager.model.data.ScheduleStatus;
import com.cts.eventsphere.eventmanager.repository.EventRepository;
import com.cts.eventsphere.eventmanager.repository.ScheduleRepository;
import com.cts.eventsphere.eventmanager.service.impl.EventServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EventServiceImplTest {

    @Mock private EventRepository eventRepository;
    @Mock private EventResponseDtoMapper eventResponseDtoMapper;
    @Mock private EventRequestDtoMapper eventRequestDtoMapper;
    @Mock private ScheduleRepository scheduleRepository;
    @Mock private ScheduleResponseDtoMapper scheduleResponseDtoMapper;
    @Mock private ScheduleRequestDtoMapper scheduleRequestDtoMapper;
    @Mock private AuditService auditService;

    @InjectMocks
    private EventServiceImpl eventService;

    private static final String USER_ID   = "user-001";
    private static final String EVENT_ID  = "event-001";
    private static final String SCHED_ID  = "sched-001";

    private Event sampleEvent;
    private EventResponseDto sampleEventResponse;
    private EventRequestDto sampleEventRequest;

    @BeforeEach
    void setUp() {
        sampleEvent = Event.builder()
                .eventId(EVENT_ID)
                .name("Test Event")
                .organizerId("org-001")
                .startDate(LocalDate.now().plusDays(1))
                .endDate(LocalDate.now().plusDays(5))
                .status(EventStatus.draft)
                .build();

        sampleEventResponse = EventResponseDto.builder()
                .id(EVENT_ID)
                .eventName("Test Event")
                .organizerId("org-001")
                .startAt(LocalDate.now().plusDays(1).toString())
                .endAt(LocalDate.now().plusDays(5).toString())
                .status(EventStatus.draft)
                .venueId("venue-001")
                .build();

        sampleEventRequest = EventRequestDto.builder()
                .name("Test Event")
                .organizerId("org-001")
                .startDate(LocalDate.now().plusDays(1))
                .endDate(LocalDate.now().plusDays(5))
                .venueId("venue-001")
                .status(EventStatus.draft)
                .build();
    }

    // -------------------------------------------------------------------------
    // create
    // -------------------------------------------------------------------------
    @Nested
    @DisplayName("create()")
    class Create {

        @Test
        @DisplayName("happy path – saves event, logs audit, returns response DTO")
        void create_happyPath() {
            when(eventRequestDtoMapper.toEntity(sampleEventRequest)).thenReturn(sampleEvent);
            when(eventRepository.save(sampleEvent)).thenReturn(sampleEvent);
            when(eventResponseDtoMapper.toDTO(sampleEvent)).thenReturn(sampleEventResponse);

            EventResponseDto result = eventService.create(USER_ID, sampleEventRequest);

            assertThat(result).isEqualTo(sampleEventResponse);
            verify(eventRepository).save(sampleEvent);
            verify(auditService).logAudit(USER_ID, AuditAction.CREATE, Event.class, EVENT_ID);
        }

        @Test
        @DisplayName("null venueId branch – still saves event successfully when venueId is null")
        void create_withNullVenueId() {
            EventRequestDto requestWithNullVenue = EventRequestDto.builder()
                    .name("Test Event")
                    .organizerId("org-001")
                    .startDate(LocalDate.now().plusDays(1))
                    .endDate(LocalDate.now().plusDays(5))
                    .venueId(null)
                    .status(EventStatus.draft)
                    .build();

            when(eventRequestDtoMapper.toEntity(requestWithNullVenue)).thenReturn(sampleEvent);
            when(eventRepository.save(sampleEvent)).thenReturn(sampleEvent);
            when(eventResponseDtoMapper.toDTO(sampleEvent)).thenReturn(sampleEventResponse);

            EventResponseDto result = eventService.create(USER_ID, requestWithNullVenue);

            assertThat(result).isEqualTo(sampleEventResponse);
            verify(eventRepository).save(sampleEvent);
        }
    }

    // -------------------------------------------------------------------------
    // findAllEvents
    // -------------------------------------------------------------------------
    @Nested
    @DisplayName("findAllEvents()")
    class FindAllEvents {

        @Test
        @DisplayName("happy path – returns mapped DTOs for every stored event")
        void findAllEvents_happyPath() {
            when(eventRepository.findAll()).thenReturn(List.of(sampleEvent));
            when(eventResponseDtoMapper.toDTO(sampleEvent)).thenReturn(sampleEventResponse);

            List<EventResponseDto> result = eventService.findAllEvents(USER_ID);

            assertThat(result).hasSize(1).containsExactly(sampleEventResponse);
            verify(auditService).logAudit(USER_ID, AuditAction.READ, Event.class, EVENT_ID);
        }

        @Test
        @DisplayName("unhappy path – returns empty list when no events exist")
        void findAllEvents_empty() {
            when(eventRepository.findAll()).thenReturn(List.of());

            List<EventResponseDto> result = eventService.findAllEvents(USER_ID);

            assertThat(result).isEmpty();
            verifyNoMoreInteractions(auditService);
        }
    }

    // -------------------------------------------------------------------------
    // findById
    // -------------------------------------------------------------------------
    @Nested
    @DisplayName("findById()")
    class FindById {

        @Test
        @DisplayName("happy path – finds event and returns response DTO")
        void findById_happyPath() {
            when(eventRepository.findById(EVENT_ID)).thenReturn(Optional.of(sampleEvent));
            when(eventResponseDtoMapper.toDTO(sampleEvent)).thenReturn(sampleEventResponse);

            EventResponseDto result = eventService.findById(EVENT_ID, USER_ID);

            assertThat(result).isEqualTo(sampleEventResponse);
            verify(auditService).logAudit(USER_ID, AuditAction.READ, Event.class, EVENT_ID);
        }

        @Test
        @DisplayName("unhappy path – throws EventNotFoundException when event does not exist")
        void findById_notFound() {
            when(eventRepository.findById(EVENT_ID)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> eventService.findById(EVENT_ID, USER_ID))
                    .isInstanceOf(EventNotFoundException.class)
                    .hasMessageContaining(EVENT_ID);

            verifyNoInteractions(auditService);
        }
    }

    // -------------------------------------------------------------------------
    // updateById
    // -------------------------------------------------------------------------
    @Nested
    @DisplayName("updateById()")
    class UpdateById {

        @Test
        @DisplayName("happy path – updates event, logs audit, returns true")
        void updateById_happyPath() {
            when(eventRepository.existsById(EVENT_ID)).thenReturn(true);
            when(eventRequestDtoMapper.toEntity(sampleEventRequest)).thenReturn(sampleEvent);
            when(eventRepository.save(any(Event.class))).thenReturn(sampleEvent);

            boolean result = eventService.updateById(EVENT_ID, sampleEventRequest, USER_ID);

            assertThat(result).isTrue();
            verify(eventRepository).save(any(Event.class));
            verify(auditService).logAudit(USER_ID, AuditAction.UPDATE, Event.class, EVENT_ID);
        }

        @Test
        @DisplayName("unhappy path – throws EventNotFoundException when event does not exist")
        void updateById_notFound() {
            when(eventRepository.existsById(EVENT_ID)).thenReturn(false);

            assertThatThrownBy(() -> eventService.updateById(EVENT_ID, sampleEventRequest, USER_ID))
                    .isInstanceOf(EventNotFoundException.class)
                    .hasMessageContaining(EVENT_ID);

            verify(eventRepository, never()).save(any());
            verifyNoInteractions(auditService);
        }
    }

    // -------------------------------------------------------------------------
    // deleteById
    // -------------------------------------------------------------------------
    @Nested
    @DisplayName("deleteById()")
    class DeleteById {

        @Test
        @DisplayName("happy path – deletes event, logs audit, returns true")
        void deleteById_happyPath() {
            when(eventRepository.existsById(EVENT_ID)).thenReturn(true);

            boolean result = eventService.deleteById(EVENT_ID, USER_ID);

            assertThat(result).isTrue();
            verify(eventRepository).deleteById(EVENT_ID);
            verify(auditService).logAudit(USER_ID, AuditAction.DELETE, Event.class, EVENT_ID);
        }

        @Test
        @DisplayName("unhappy path – throws EventNotFoundException when event does not exist")
        void deleteById_notFound() {
            when(eventRepository.existsById(EVENT_ID)).thenReturn(false);

            assertThatThrownBy(() -> eventService.deleteById(EVENT_ID, USER_ID))
                    .isInstanceOf(EventNotFoundException.class)
                    .hasMessageContaining(EVENT_ID);

            verify(eventRepository, never()).deleteById(any());
            verifyNoInteractions(auditService);
        }
    }

    // -------------------------------------------------------------------------
    // addActivity
    // -------------------------------------------------------------------------
    @Nested
    @DisplayName("addActivity()")
    class AddActivity {

        @Test
        @DisplayName("happy path – adds schedule to existing event and returns response DTO")
        void addActivity_happyPath() {
            ScheduleRequestDto scheduleRequest = ScheduleRequestDto.builder()
                    .eventId(EVENT_ID)
                    .date(LocalDate.now().plusDays(2))
                    .timeSlot("09:00-10:00")
                    .activity("Keynote Speech")
                    .status(ScheduleStatus.active)
                    .build();

            Schedule schedule = Schedule.builder()
                    .scheduleId(SCHED_ID)
                    .event(sampleEvent)
                    .date(LocalDate.now().plusDays(2))
                    .timeSlot("09:00-10:00")
                    .activity("Keynote Speech")
                    .status(ScheduleStatus.active)
                    .build();

            ScheduleResponseDto scheduleResponse = ScheduleResponseDto.builder()
                    .scheduleId(SCHED_ID)
                    .eventId(EVENT_ID)
                    .date(LocalDate.now().plusDays(2).toString())
                    .timeSlot("09:00-10:00")
                    .activity("Keynote Speech")
                    .status(ScheduleStatus.active)
                    .build();

            when(eventRepository.findById(EVENT_ID)).thenReturn(Optional.of(sampleEvent));
            when(scheduleRequestDtoMapper.toEntity(scheduleRequest, sampleEvent)).thenReturn(schedule);
            when(scheduleRepository.save(schedule)).thenReturn(schedule);
            when(scheduleResponseDtoMapper.toDTO(schedule)).thenReturn(scheduleResponse);

            ScheduleResponseDto result = eventService.addActivity(EVENT_ID, scheduleRequest, USER_ID);

            assertThat(result).isEqualTo(scheduleResponse);
            verify(scheduleRepository).save(schedule);
            verify(auditService).logAudit(USER_ID, AuditAction.CREATE, Schedule.class, SCHED_ID);
        }

        @Test
        @DisplayName("unhappy path – throws EventNotFoundException when parent event does not exist")
        void addActivity_eventNotFound() {
            ScheduleRequestDto scheduleRequest = ScheduleRequestDto.builder()
                    .eventId(EVENT_ID)
                    .date(LocalDate.now().plusDays(1))
                    .timeSlot("09:00-10:00")
                    .activity("Panel")
                    .status(ScheduleStatus.draft)
                    .build();

            when(eventRepository.findById(EVENT_ID)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> eventService.addActivity(EVENT_ID, scheduleRequest, USER_ID))
                    .isInstanceOf(EventNotFoundException.class)
                    .hasMessageContaining(EVENT_ID);

            verify(scheduleRepository, never()).save(any());
            verifyNoInteractions(auditService);
        }
    }

    // -------------------------------------------------------------------------
    // findAllSchedules
    // -------------------------------------------------------------------------
    @Nested
    @DisplayName("findAllSchedules()")
    class FindAllSchedules {

        @Test
        @DisplayName("happy path – returns only schedules belonging to the requested event")
        void findAllSchedules_happyPath() {
            Schedule schedule = Schedule.builder()
                    .scheduleId(SCHED_ID)
                    .event(sampleEvent)
                    .date(LocalDate.now().plusDays(1))
                    .timeSlot("10:00-11:00")
                    .activity("Workshop")
                    .status(ScheduleStatus.active)
                    .build();

            ScheduleResponseDto scheduleResponse = ScheduleResponseDto.builder()
                    .scheduleId(SCHED_ID)
                    .eventId(EVENT_ID)
                    .date(LocalDate.now().plusDays(1).toString())
                    .timeSlot("10:00-11:00")
                    .activity("Workshop")
                    .status(ScheduleStatus.active)
                    .build();

            when(scheduleRepository.findAll()).thenReturn(List.of(schedule));
            when(scheduleResponseDtoMapper.toDTO(schedule)).thenReturn(scheduleResponse);

            List<ScheduleResponseDto> result = eventService.findAllSchedules(EVENT_ID, USER_ID);

            assertThat(result).hasSize(1).containsExactly(scheduleResponse);
            verify(auditService).logAudit(USER_ID, AuditAction.READ, Schedule.class, SCHED_ID);
        }

        @Test
        @DisplayName("unhappy path – returns empty list when no schedules match the event ID")
        void findAllSchedules_noMatchingSchedules() {
            Event otherEvent = Event.builder().eventId("other-event").build();
            Schedule otherSchedule = Schedule.builder()
                    .scheduleId("other-sched")
                    .event(otherEvent)
                    .build();

            when(scheduleRepository.findAll()).thenReturn(List.of(otherSchedule));

            List<ScheduleResponseDto> result = eventService.findAllSchedules(EVENT_ID, USER_ID);

            assertThat(result).isEmpty();
            verifyNoInteractions(auditService);
        }
    }
}