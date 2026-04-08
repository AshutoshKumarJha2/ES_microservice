package com.cts.eventsphere.eventmanager.service;

import com.cts.eventsphere.eventmanager.dto.mapper.schedule.ScheduleRequestDtoMapper;
import com.cts.eventsphere.eventmanager.dto.mapper.schedule.ScheduleResponseDtoMapper;
import com.cts.eventsphere.eventmanager.dto.schedule.ScheduleRequestDto;
import com.cts.eventsphere.eventmanager.dto.schedule.ScheduleResponseDto;
import com.cts.eventsphere.eventmanager.exception.event.EventNotFoundException;
import com.cts.eventsphere.eventmanager.exception.schedule.ScheduleNotFoundException;
import com.cts.eventsphere.eventmanager.model.Event;
import com.cts.eventsphere.eventmanager.model.Schedule;
import com.cts.eventsphere.eventmanager.model.data.ScheduleStatus;
import com.cts.eventsphere.eventmanager.repository.EventRepository;
import com.cts.eventsphere.eventmanager.repository.ScheduleRepository;
import com.cts.eventsphere.eventmanager.service.NotificationService;
import com.cts.eventsphere.eventmanager.service.impl.ScheduleServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ScheduleServiceImplTest {

    @Mock private ScheduleRepository scheduleRepository;
    @Mock private EventRepository eventRepository;
    @Mock private ScheduleResponseDtoMapper scheduleResponseDtoMapper;
    @Mock private ScheduleRequestDtoMapper scheduleRequestDtoMapper;
    @Mock private NotificationService notificationService;

    @InjectMocks
    private ScheduleServiceImpl scheduleService;

    private static final String EVENT_ID  = "event-001";
    private static final String SCHED_ID  = "sched-001";

    private Event sampleEvent;
    private Schedule sampleSchedule;
    private ScheduleRequestDto sampleRequest;
    private ScheduleResponseDto sampleResponse;

    @BeforeEach
    void setUp() {
        sampleEvent = Event.builder()
                .eventId(EVENT_ID)
                .name("Test Event")
                .organizerId("org-001")
                .build();

        sampleSchedule = Schedule.builder()
                .scheduleId(SCHED_ID)
                .event(sampleEvent)
                .date(LocalDate.now().plusDays(1))
                .timeSlot("09:00-10:00")
                .activity("Opening Keynote")
                .status(ScheduleStatus.ACTIVE)
                .build();

        sampleRequest = ScheduleRequestDto.builder()
                .eventId(EVENT_ID)
                .date(LocalDate.now().plusDays(1))
                .timeSlot("09:00-10:00")
                .activity("Opening Keynote")
                .status(ScheduleStatus.ACTIVE)
                .build();

        sampleResponse = ScheduleResponseDto.builder()
                .scheduleId(SCHED_ID)
                .eventId(EVENT_ID)
                .date(LocalDate.now().plusDays(1).toString())
                .timeSlot("09:00-10:00")
                .activity("Opening Keynote")
                .status(ScheduleStatus.ACTIVE)
                .build();
    }

    // -------------------------------------------------------------------------
    // updateById
    // -------------------------------------------------------------------------
    @Nested
    @DisplayName("updateById()")
    class UpdateById {

        @Test
        @DisplayName("happy path – updates schedule and returns response DTO")
        void updateById_happyPath() {
            when(scheduleRepository.existsById(SCHED_ID)).thenReturn(true);
            when(eventRepository.findById(EVENT_ID)).thenReturn(Optional.of(sampleEvent));
            when(scheduleRequestDtoMapper.toEntity(sampleRequest, sampleEvent)).thenReturn(sampleSchedule);
            when(scheduleRepository.save(sampleSchedule)).thenReturn(sampleSchedule);
            when(scheduleResponseDtoMapper.toDTO(sampleSchedule)).thenReturn(sampleResponse);

            ScheduleResponseDto result = scheduleService.updateById(EVENT_ID, SCHED_ID, sampleRequest);

            assertThat(result).isEqualTo(sampleResponse);
            assertThat(sampleSchedule.getScheduleId()).isEqualTo(SCHED_ID);
            verify(scheduleRepository).save(sampleSchedule);
        }

        @Test
        @DisplayName("unhappy path – throws ScheduleNotFoundException when schedule does not exist")
        void updateById_scheduleNotFound() {
            when(scheduleRepository.existsById(SCHED_ID)).thenReturn(false);

            assertThatThrownBy(() -> scheduleService.updateById(EVENT_ID, SCHED_ID, sampleRequest))
                    .isInstanceOf(ScheduleNotFoundException.class)
                    .hasMessageContaining(SCHED_ID);

            verify(scheduleRepository, never()).save(any());
            verifyNoInteractions(eventRepository);
        }

        @Test
        @DisplayName("unhappy path – throws EventNotFoundException when parent event does not exist")
        void updateById_eventNotFound() {
            when(scheduleRepository.existsById(SCHED_ID)).thenReturn(true);
            when(eventRepository.findById(EVENT_ID)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> scheduleService.updateById(EVENT_ID, SCHED_ID, sampleRequest))
                    .isInstanceOf(EventNotFoundException.class)
                    .hasMessageContaining(EVENT_ID);

            verify(scheduleRepository, never()).save(any());
        }
    }

    // -------------------------------------------------------------------------
    // deleteById
    // -------------------------------------------------------------------------
    @Nested
    @DisplayName("deleteById()")
    class DeleteById {

        @Test
        @DisplayName("happy path – deletes schedule and returns true")
        void deleteById_happyPath() {
            when(scheduleRepository.findById(SCHED_ID)).thenReturn(Optional.of(sampleSchedule));

            boolean result = scheduleService.deleteById(SCHED_ID);

            assertThat(result).isTrue();
            verify(scheduleRepository).deleteById(SCHED_ID);
        }

        @Test
        @DisplayName("unhappy path – throws ScheduleNotFoundException when schedule does not exist")
        void deleteById_notFound() {
            when(scheduleRepository.findById(SCHED_ID)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> scheduleService.deleteById(SCHED_ID))
                    .isInstanceOf(ScheduleNotFoundException.class)
                    .hasMessageContaining(SCHED_ID);

            verify(scheduleRepository, never()).deleteById(any());
        }
    }
}
