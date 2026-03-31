package com.cts.eventsphere.eventmanager.model;

import com.cts.eventsphere.eventmanager.exception.ticket.TicketUnavailableException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class ModelLifecycleTest {

    // =========================================================================
    // Event.prePersist()
    // =========================================================================
    @Nested
    @DisplayName("Event.prePersist()")
    class EventPrePersist {

        @Test
        @DisplayName("generates a UUID when eventId is null")
        void prePersist_nullId_generatesUuid() {
            Event event = new Event();
            // eventId is null at this point
            event.prePersist();

            assertThat(event.getEventId())
                    .isNotNull()
                    .matches("[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}");
        }

        @Test
        @DisplayName("keeps existing eventId when it is already set")
        void prePersist_existingId_keepsId() {
            Event event = new Event();
            event.setEventId("existing-id");

            event.prePersist();

            assertThat(event.getEventId()).isEqualTo("existing-id");
        }
    }

    // =========================================================================
    // Schedule.prePersist()
    // =========================================================================
    @Nested
    @DisplayName("Schedule.prePersist()")
    class SchedulePrePersist {

        @Test
        @DisplayName("generates a UUID when scheduleId is null")
        void prePersist_nullId_generatesUuid() {
            Schedule schedule = Schedule.builder().build();
            // scheduleId is null at this point
            schedule.prePersist();

            assertThat(schedule.getScheduleId())
                    .isNotNull()
                    .matches("[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}");
        }

        @Test
        @DisplayName("keeps existing scheduleId when it is already set")
        void prePersist_existingId_keepsId() {
            Schedule schedule = Schedule.builder()
                    .scheduleId("existing-sched-id")
                    .build();

            schedule.prePersist();

            assertThat(schedule.getScheduleId()).isEqualTo("existing-sched-id");
        }
    }

    // =========================================================================
    // TicketUnavailableException
    // =========================================================================
    @Nested
    @DisplayName("TicketUnavailableException")
    class TicketUnavailableExceptionTests {

        @Test
        @DisplayName("message contains the eventId passed to the constructor")
        void constructor_includesEventIdInMessage() {
            TicketUnavailableException ex = new TicketUnavailableException("event-42");

            assertThat(ex.getMessage()).contains("event-42");
        }
    }
}
