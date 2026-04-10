package com.cts.eventsphere.eventmanager.service;

import com.cts.eventsphere.eventmanager.client.LogServiceClient;
import com.cts.eventsphere.eventmanager.dto.registration.RegistrationDto;
import com.cts.eventsphere.eventmanager.dto.registration.RegistrationListResponseDto;
import com.cts.eventsphere.eventmanager.dto.shared.GenericResponse;
import com.cts.eventsphere.eventmanager.exception.event.EventNotFoundException;
import com.cts.eventsphere.eventmanager.exception.registration.DuplicateRegistrationException;
import com.cts.eventsphere.eventmanager.exception.registration.InvalidRegistrationStatusException;
import com.cts.eventsphere.eventmanager.exception.registration.RegistrationNotFoundException;
import com.cts.eventsphere.eventmanager.exception.ticket.TicketNotFoundException;
import com.cts.eventsphere.eventmanager.model.Event;
import com.cts.eventsphere.eventmanager.model.Registration;
import com.cts.eventsphere.eventmanager.model.Ticket;
import com.cts.eventsphere.eventmanager.model.data.RegistrationStatus;
import com.cts.eventsphere.eventmanager.model.data.TicketStatus;
import com.cts.eventsphere.eventmanager.repository.EventRepository;
import com.cts.eventsphere.eventmanager.repository.RegistrationRepository;
import com.cts.eventsphere.eventmanager.repository.TicketRepository;
import com.cts.eventsphere.eventmanager.service.impl.RegistrationServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RegistrationServiceImplTest {

    @Mock private RegistrationRepository registrationRepo;
    @Mock private TicketRepository ticketRepository;
    @Mock private EventRepository eventRepository;
    @Mock private LogServiceClient logServiceClient;

    @InjectMocks
    private RegistrationServiceImpl registrationService;

    private static final String USER_ID    = "user-001";
    private static final String EVENT_ID   = "event-001";
    private static final String TICKET_ID  = "ticket-001";
    private static final String REG_ID     = "reg-001";

    private Event sampleEvent;
    private Ticket sampleTicket;
    private Registration sampleRegistration;

    @BeforeEach
    void setUp() {
        sampleEvent = Event.builder()
                .eventId(EVENT_ID)
                .name("Test Event")
                .organizerId("org-001")
                .build();

        sampleTicket = Ticket.builder()
                .ticketId(TICKET_ID)
                .event(sampleEvent)
                .type("general")
                .price(BigDecimal.valueOf(100.0))
                .status(TicketStatus.ACTIVE)
                .build();

        sampleRegistration = Registration.builder()
                .registrationId(REG_ID)
                .event(sampleEvent)
                .attendeeId(USER_ID)
                .ticket(sampleTicket)
                .status(RegistrationStatus.PENDING)
                .build();
    }

    // -------------------------------------------------------------------------
    // registerForEvent
    // -------------------------------------------------------------------------
    @Nested
    @DisplayName("registerForEvent()")
    class RegisterForEvent {

        @Test
        @DisplayName("happy path – creates PENDING registration and sends notification")
        void registerForEvent_happyPath() {
            when(registrationRepo.existsByEventEventIdAndAttendeeId(EVENT_ID, USER_ID)).thenReturn(false);
            when(eventRepository.findById(EVENT_ID)).thenReturn(Optional.of(sampleEvent));
            when(ticketRepository.findById(TICKET_ID)).thenReturn(Optional.of(sampleTicket));
            when(registrationRepo.save(any(Registration.class))).thenReturn(sampleRegistration);
            when(logServiceClient.sendNotification(any(), any(), any()))
                    .thenReturn(ResponseEntity.status(201).build());

            RegistrationDto result = registrationService.registerForEvent(USER_ID, EVENT_ID, TICKET_ID);

            assertThat(result.status()).isEqualTo(RegistrationStatus.PENDING.name());
            verify(registrationRepo).save(any(Registration.class));
        }

        @Test
        @DisplayName("unhappy path – throws DuplicateRegistrationException when already registered")
        void registerForEvent_duplicate() {
            when(registrationRepo.existsByEventEventIdAndAttendeeId(EVENT_ID, USER_ID)).thenReturn(true);

            assertThatThrownBy(() -> registrationService.registerForEvent(USER_ID, EVENT_ID, TICKET_ID))
                    .isInstanceOf(DuplicateRegistrationException.class)
                    .hasMessageContaining(USER_ID)
                    .hasMessageContaining(EVENT_ID);

            verify(registrationRepo, never()).save(any());
        }

        @Test
        @DisplayName("unhappy path – throws EventNotFoundException when event does not exist")
        void registerForEvent_eventNotFound() {
            when(registrationRepo.existsByEventEventIdAndAttendeeId(EVENT_ID, USER_ID)).thenReturn(false);
            when(eventRepository.findById(EVENT_ID)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> registrationService.registerForEvent(USER_ID, EVENT_ID, TICKET_ID))
                    .isInstanceOf(EventNotFoundException.class)
                    .hasMessageContaining(EVENT_ID);

            verify(registrationRepo, never()).save(any());
        }

        @Test
        @DisplayName("unhappy path – throws TicketNotFoundException when ticket does not exist")
        void registerForEvent_ticketNotFound() {
            when(registrationRepo.existsByEventEventIdAndAttendeeId(EVENT_ID, USER_ID)).thenReturn(false);
            when(eventRepository.findById(EVENT_ID)).thenReturn(Optional.of(sampleEvent));
            when(ticketRepository.findById(TICKET_ID)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> registrationService.registerForEvent(USER_ID, EVENT_ID, TICKET_ID))
                    .isInstanceOf(TicketNotFoundException.class)
                    .hasMessageContaining(TICKET_ID);

            verify(registrationRepo, never()).save(any());
        }
    }

    // -------------------------------------------------------------------------
    // deleteRegistration
    // -------------------------------------------------------------------------
    @Nested
    @DisplayName("deleteRegistration()")
    class DeleteRegistration {

        @Test
        @DisplayName("happy path – deletes existing registration")
        void deleteRegistration_happyPath() {
            when(registrationRepo.existsById(REG_ID)).thenReturn(true);

            GenericResponse result = registrationService.deleteRegistration(USER_ID, REG_ID);

            assertThat(result.message()).isEqualTo("Registration deleted successfully");
            verify(registrationRepo).deleteById(REG_ID);
        }

        @Test
        @DisplayName("unhappy path – throws RegistrationNotFoundException when registration does not exist")
        void deleteRegistration_notFound() {
            when(registrationRepo.existsById(REG_ID)).thenReturn(false);

            assertThatThrownBy(() -> registrationService.deleteRegistration(USER_ID, REG_ID))
                    .isInstanceOf(RegistrationNotFoundException.class);

            verify(registrationRepo, never()).deleteById(any());
        }
    }

    // -------------------------------------------------------------------------
    // cancelRegistration
    // -------------------------------------------------------------------------
    @Nested
    @DisplayName("cancelRegistration()")
    class CancelRegistration {

        @Test
        @DisplayName("happy path – sets status to CANCELLED and sends notification")
        void cancelRegistration_happyPath() {
            when(registrationRepo.findById(REG_ID)).thenReturn(Optional.of(sampleRegistration));
            when(registrationRepo.save(sampleRegistration)).thenReturn(sampleRegistration);
            when(logServiceClient.sendNotification(any(), any(), any()))
                    .thenReturn(ResponseEntity.status(201).build());

            GenericResponse result = registrationService.cancelRegistration(USER_ID, REG_ID);

            assertThat(result.message()).isEqualTo("Registration cancelled successfully");
            assertThat(sampleRegistration.getStatus()).isEqualTo(RegistrationStatus.CANCELLED);
            verify(registrationRepo).save(sampleRegistration);
        }

        @Test
        @DisplayName("unhappy path – throws RegistrationNotFoundException when not found")
        void cancelRegistration_notFound() {
            when(registrationRepo.findById(REG_ID)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> registrationService.cancelRegistration(USER_ID, REG_ID))
                    .isInstanceOf(RegistrationNotFoundException.class);

            verify(registrationRepo, never()).save(any());
        }
    }

    // -------------------------------------------------------------------------
    // approveRegistration
    // -------------------------------------------------------------------------
    @Nested
    @DisplayName("approveRegistration()")
    class ApproveRegistration {

        @Test
        @DisplayName("happy path – sets status to CONFIRMED and sends notification")
        void approveRegistration_happyPath() {
            when(registrationRepo.findById(REG_ID)).thenReturn(Optional.of(sampleRegistration));
            when(registrationRepo.save(sampleRegistration)).thenReturn(sampleRegistration);
            when(logServiceClient.sendNotification(any(), any(), any()))
                    .thenReturn(ResponseEntity.status(201).build());

            GenericResponse result = registrationService.approveRegistration(USER_ID, REG_ID);

            assertThat(result.message()).isEqualTo("Registration approved successfully");
            assertThat(sampleRegistration.getStatus()).isEqualTo(RegistrationStatus.CONFIRMED);
            verify(registrationRepo).save(sampleRegistration);
        }

        @Test
        @DisplayName("unhappy path – throws RegistrationNotFoundException when not found")
        void approveRegistration_notFound() {
            when(registrationRepo.findById(REG_ID)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> registrationService.approveRegistration(USER_ID, REG_ID))
                    .isInstanceOf(RegistrationNotFoundException.class);
        }
    }

    // -------------------------------------------------------------------------
    // checkInRegistration
    // -------------------------------------------------------------------------
    @Nested
    @DisplayName("checkInRegistration()")
    class CheckInRegistration {

        @Test
        @DisplayName("happy path – CONFIRMED registration transitions to CHECKED_IN")
        void checkInRegistration_happyPath() {
            sampleRegistration.setStatus(RegistrationStatus.CONFIRMED);
            when(registrationRepo.findById(REG_ID)).thenReturn(Optional.of(sampleRegistration));
            when(registrationRepo.save(sampleRegistration)).thenReturn(sampleRegistration);
            when(logServiceClient.sendNotification(any(), any(), any()))
                    .thenReturn(ResponseEntity.status(201).build());

            GenericResponse result = registrationService.checkInRegistration(USER_ID, REG_ID);

            assertThat(result.message()).isEqualTo("Check-in successful");
            assertThat(sampleRegistration.getStatus()).isEqualTo(RegistrationStatus.CHECKED_IN);
            verify(registrationRepo).save(sampleRegistration);
        }

        @Test
        @DisplayName("unhappy path – throws InvalidRegistrationStatusException when status is PENDING")
        void checkInRegistration_notConfirmed_pending() {
            sampleRegistration.setStatus(RegistrationStatus.PENDING);
            when(registrationRepo.findById(REG_ID)).thenReturn(Optional.of(sampleRegistration));

            assertThatThrownBy(() -> registrationService.checkInRegistration(USER_ID, REG_ID))
                    .isInstanceOf(InvalidRegistrationStatusException.class);

            verify(registrationRepo, never()).save(any());
        }

        @Test
        @DisplayName("unhappy path – throws InvalidRegistrationStatusException when status is CANCELLED")
        void checkInRegistration_notConfirmed_cancelled() {
            sampleRegistration.setStatus(RegistrationStatus.CANCELLED);
            when(registrationRepo.findById(REG_ID)).thenReturn(Optional.of(sampleRegistration));

            assertThatThrownBy(() -> registrationService.checkInRegistration(USER_ID, REG_ID))
                    .isInstanceOf(InvalidRegistrationStatusException.class);

            verify(registrationRepo, never()).save(any());
        }

        @Test
        @DisplayName("unhappy path – throws RegistrationNotFoundException when registration does not exist")
        void checkInRegistration_notFound() {
            when(registrationRepo.findById(REG_ID)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> registrationService.checkInRegistration(USER_ID, REG_ID))
                    .isInstanceOf(RegistrationNotFoundException.class);
        }
    }

    // -------------------------------------------------------------------------
    // rejectRegistration
    // -------------------------------------------------------------------------
    @Nested
    @DisplayName("rejectRegistration()")
    class RejectRegistration {

        @Test
        @DisplayName("happy path – sets status to CANCELLED and sends notification")
        void rejectRegistration_happyPath() {
            when(registrationRepo.findById(REG_ID)).thenReturn(Optional.of(sampleRegistration));
            when(registrationRepo.save(sampleRegistration)).thenReturn(sampleRegistration);
            when(logServiceClient.sendNotification(any(), any(), any()))
                    .thenReturn(ResponseEntity.status(201).build());

            GenericResponse result = registrationService.rejectRegistration(USER_ID, REG_ID);

            assertThat(result.message()).isEqualTo("Registration rejected successfully");
            assertThat(sampleRegistration.getStatus()).isEqualTo(RegistrationStatus.CANCELLED);
        }

        @Test
        @DisplayName("unhappy path – throws RegistrationNotFoundException when not found")
        void rejectRegistration_notFound() {
            when(registrationRepo.findById(REG_ID)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> registrationService.rejectRegistration(USER_ID, REG_ID))
                    .isInstanceOf(RegistrationNotFoundException.class);
        }
    }

    // -------------------------------------------------------------------------
    // getRegistrationById
    // -------------------------------------------------------------------------
    @Nested
    @DisplayName("getRegistrationById()")
    class GetRegistrationById {

        @Test
        @DisplayName("happy path – returns mapped RegistrationDto")
        void getRegistrationById_happyPath() {
            when(registrationRepo.findById(REG_ID)).thenReturn(Optional.of(sampleRegistration));

            RegistrationDto result = registrationService.getRegistrationById(USER_ID, REG_ID);

            assertThat(result.registrationId()).isEqualTo(REG_ID);
            assertThat(result.eventId()).isEqualTo(EVENT_ID);
            assertThat(result.attendeeId()).isEqualTo(USER_ID);
            assertThat(result.status()).isEqualTo(RegistrationStatus.PENDING.name());
        }

        @Test
        @DisplayName("unhappy path – throws RegistrationNotFoundException when not found")
        void getRegistrationById_notFound() {
            when(registrationRepo.findById(REG_ID)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> registrationService.getRegistrationById(USER_ID, REG_ID))
                    .isInstanceOf(RegistrationNotFoundException.class)
                    .hasMessageContaining(REG_ID);
        }
    }

    // -------------------------------------------------------------------------
    // getRegistrationByEventIdAndUserId
    // -------------------------------------------------------------------------
    @Nested
    @DisplayName("getRegistrationByEventIdAndUserId()")
    class GetRegistrationByEventIdAndUserId {

        @Test
        @DisplayName("happy path – returns mapped RegistrationDto")
        void getRegistrationByEventIdAndUserId_happyPath() {
            when(registrationRepo.findByAttendeeIdAndEventEventId(USER_ID, EVENT_ID))
                    .thenReturn(Optional.of(sampleRegistration));

            RegistrationDto result = registrationService.getRegistrationByEventIdAndUserId(USER_ID, EVENT_ID, USER_ID);

            assertThat(result.registrationId()).isEqualTo(REG_ID);
            assertThat(result.eventId()).isEqualTo(EVENT_ID);
        }

        @Test
        @DisplayName("unhappy path – throws RegistrationNotFoundException when no registration found")
        void getRegistrationByEventIdAndUserId_notFound() {
            when(registrationRepo.findByAttendeeIdAndEventEventId(USER_ID, EVENT_ID))
                    .thenReturn(Optional.empty());

            assertThatThrownBy(() -> registrationService.getRegistrationByEventIdAndUserId(USER_ID, EVENT_ID, USER_ID))
                    .isInstanceOf(RegistrationNotFoundException.class)
                    .hasMessageContaining(EVENT_ID)
                    .hasMessageContaining(USER_ID);
        }
    }

    // -------------------------------------------------------------------------
    // getRegistrationsByUserId
    // -------------------------------------------------------------------------
    @Nested
    @DisplayName("getRegistrationsByUserId()")
    class GetRegistrationsByUserId {

        @Test
        @DisplayName("happy path – returns paginated registrations for user")
        void getRegistrationsByUserId_happyPath() {
            var page = new PageImpl<>(List.of(sampleRegistration), PageRequest.of(0, 10), 1);
            when(registrationRepo.findByAttendeeId(eq(USER_ID), any())).thenReturn(page);

            RegistrationListResponseDto result =
                    registrationService.getRegistrationsByUserId(USER_ID, USER_ID, 10, 0);

            assertThat(result.registrations()).hasSize(1);
            assertThat(result.totalElements()).isEqualTo(1);
            assertThat(result.page()).isZero();
        }
    }

    // -------------------------------------------------------------------------
    // getRegistrationsByEventIdStatus
    // -------------------------------------------------------------------------
    @Nested
    @DisplayName("getRegistrationsByEventIdStatus()")
    class GetRegistrationsByEventIdStatus {

        @Test
        @DisplayName("happy path – returns all registrations when status filter is null")
        void getRegistrationsByEventIdStatus_noFilter() {
            var page = new PageImpl<>(List.of(sampleRegistration), PageRequest.of(0, 10), 1);
            when(registrationRepo.findByEventEventId(eq(EVENT_ID), any())).thenReturn(page);

            RegistrationListResponseDto result =
                    registrationService.getRegistrationsByEventIdStatus(USER_ID, EVENT_ID, null, 10, 0);

            assertThat(result.registrations()).hasSize(1);
            verify(registrationRepo).findByEventEventId(eq(EVENT_ID), any());
        }

        @Test
        @DisplayName("happy path – returns filtered registrations when status is valid")
        void getRegistrationsByEventIdStatus_withValidStatus() {
            var page = new PageImpl<>(List.of(sampleRegistration), PageRequest.of(0, 10), 1);
            when(registrationRepo.findByEventEventIdAndStatus(eq(EVENT_ID), eq(RegistrationStatus.PENDING), any()))
                    .thenReturn(page);

            RegistrationListResponseDto result =
                    registrationService.getRegistrationsByEventIdStatus(USER_ID, EVENT_ID, "PENDING", 10, 0);

            assertThat(result.registrations()).hasSize(1);
        }

        @Test
        @DisplayName("unhappy path – throws RegistrationNotFoundException for invalid status value")
        void getRegistrationsByEventIdStatus_invalidStatus() {
            assertThatThrownBy(() ->
                    registrationService.getRegistrationsByEventIdStatus(USER_ID, EVENT_ID, "INVALID_STATUS", 10, 0))
                    .isInstanceOf(RegistrationNotFoundException.class)
                    .hasMessageContaining("INVALID_STATUS");
        }

        @Test
        @DisplayName("happy path – returns all registrations when status filter is empty string")
        void getRegistrationsByEventIdStatus_emptyStatus() {
            var page = new PageImpl<>(List.of(sampleRegistration), PageRequest.of(0, 10), 1);
            when(registrationRepo.findByEventEventId(eq(EVENT_ID), any())).thenReturn(page);

            RegistrationListResponseDto result =
                    registrationService.getRegistrationsByEventIdStatus(USER_ID, EVENT_ID, "", 10, 0);

            assertThat(result.registrations()).hasSize(1);
        }
    }

    // -------------------------------------------------------------------------
    // getAllRegistrations
    // -------------------------------------------------------------------------
    @Nested
    @DisplayName("getAllRegistrations()")
    class GetAllRegistrations {

        @Test
        @DisplayName("happy path – returns paginated list of all registrations")
        void getAllRegistrations_happyPath() {
            var page = new PageImpl<>(List.of(sampleRegistration), PageRequest.of(0, 10), 1);
            when(registrationRepo.findAll(any(PageRequest.class))).thenReturn(page);

            RegistrationListResponseDto result = registrationService.getAllRegistrations(USER_ID, 10, 0);

            assertThat(result.registrations()).hasSize(1);
            assertThat(result.totalElements()).isEqualTo(1);
        }
    }

    // -------------------------------------------------------------------------
    // notifyUser – failure is swallowed
    // -------------------------------------------------------------------------
    @Nested
    @DisplayName("notifyUser() – feign failure handling")
    class NotifyUser {

        @Test
        @DisplayName("notification Feign failure does not interrupt registration")
        void registerForEvent_notificationFailure_doesNotThrow() {
            when(registrationRepo.existsByEventEventIdAndAttendeeId(EVENT_ID, USER_ID)).thenReturn(false);
            when(eventRepository.findById(EVENT_ID)).thenReturn(Optional.of(sampleEvent));
            when(ticketRepository.findById(TICKET_ID)).thenReturn(Optional.of(sampleTicket));
            when(registrationRepo.save(any(Registration.class))).thenReturn(sampleRegistration);
            when(logServiceClient.sendNotification(any(), any(), any()))
                    .thenThrow(feign.FeignException.class);

            RegistrationDto result = registrationService.registerForEvent(USER_ID, EVENT_ID, TICKET_ID);

            assertThat(result.status()).isEqualTo(RegistrationStatus.PENDING.name());
        }
    }
}