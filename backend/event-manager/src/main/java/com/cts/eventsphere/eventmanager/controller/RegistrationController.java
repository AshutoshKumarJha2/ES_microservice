package com.cts.eventsphere.eventmanager.controller;

import com.cts.eventsphere.eventmanager.dto.registration.RegistrationDto;
import com.cts.eventsphere.eventmanager.dto.registration.RegistrationListResponseDto;
import com.cts.eventsphere.eventmanager.dto.registration.RegistrationRequestDto;
import com.cts.eventsphere.eventmanager.dto.shared.GenericResponse;
import com.cts.eventsphere.eventmanager.auth.dto.UserPrincipal;
import com.cts.eventsphere.eventmanager.service.RegistrationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for event registration management.
 * Handles attendee registration, status transitions (approve, reject, cancel, check-in),
 * and retrieval of registration records.
 *
 * @author test-in-prod-10x
 * @version 1.0
 * @since 2026-03-26
 */
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Slf4j
public class RegistrationController {

    private final RegistrationService registrationService;

    @PostMapping("/events/{eventId}/registrations")
    @PreAuthorize("hasRole('ATTENDEE')")
    public ResponseEntity<GenericResponse> createRegistration(
            @PathVariable String eventId,
            @AuthenticationPrincipal UserPrincipal userDetails,
            @RequestBody @Valid RegistrationRequestDto request) {
        var userId = userDetails.userId();
        log.info("Creating registration for eventId: {}, userId: {}, ticketId: {}", eventId, userId, request.ticketId());
        return ResponseEntity.ok(registrationService.registerForEvent(userId, eventId, request.ticketId()));
    }

    @GetMapping("/events/{eventId}/registrations")
    @PreAuthorize("hasAnyRole('ORGANIZER', 'ADMIN')")
    public ResponseEntity<RegistrationListResponseDto> getAllRegistrationsByEvent(
            @PathVariable String eventId,
            @AuthenticationPrincipal UserPrincipal userDetails,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "0") int page) {
        var actorId = userDetails.userId();
        log.info("Getting registrations for eventId: {}, actorId: {}", eventId, actorId);
        return ResponseEntity.ok(registrationService.getRegistrationsByEventIdStatus(actorId, eventId, status, size, page));
    }

    @GetMapping("/events/{eventId}/my-registration")
    @PreAuthorize("hasRole('ATTENDEE')")
    public ResponseEntity<RegistrationDto> getMyRegistrationForEvent(
            @PathVariable String eventId,
            @AuthenticationPrincipal UserPrincipal userDetails) {
        var userId = userDetails.userId();
        log.info("User {} checking registration for event {}", userId, eventId);
        return ResponseEntity.ok(registrationService.getRegistrationByEventIdAndUserId(userId, eventId, userId));
    }

    @GetMapping("/registrations/{registrationId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER')")
    public ResponseEntity<RegistrationDto> getRegistrationById(
            @PathVariable String registrationId,
            @AuthenticationPrincipal UserPrincipal userDetails) {
        var actorId = userDetails.userId();
        log.info("Getting registration for id: {} by actor: {}", registrationId, actorId);
        return ResponseEntity.ok(registrationService.getRegistrationById(actorId, registrationId));
    }

    @PatchMapping("/registrations/{registrationId}/cancel")
    @PreAuthorize("hasRole('ATTENDEE')")
    public ResponseEntity<GenericResponse> cancelRegistration(
            @PathVariable String registrationId,
            @AuthenticationPrincipal UserPrincipal userDetails) {
        var actorId = userDetails.userId();
        log.info("Cancelling registration: {} by actor: {}", registrationId, actorId);
        return ResponseEntity.ok(registrationService.cancelRegistration(actorId, registrationId));
    }

    @PatchMapping("/registrations/{registrationId}/check-in")
    @PreAuthorize("hasRole('ATTENDEE')")
    public ResponseEntity<GenericResponse> checkInRegistration(
            @PathVariable String registrationId,
            @AuthenticationPrincipal UserPrincipal userDetails) {
        var actorId = userDetails.userId();
        log.info("Checking in registration: {} by actor: {}", registrationId, actorId);
        return ResponseEntity.ok(registrationService.checkInRegistration(actorId, registrationId));
    }

    @PatchMapping("/registrations/{registrationId}/approve")
    @PreAuthorize("hasAnyRole('ORGANIZER', 'ADMIN')")
    public ResponseEntity<GenericResponse> approveRegistration(
            @PathVariable String registrationId,
            @AuthenticationPrincipal UserPrincipal userDetails) {
        var actorId = userDetails.userId();
        log.info("Approving registration: {} by actor: {}", registrationId, actorId);
        return ResponseEntity.ok(registrationService.approveRegistration(actorId, registrationId));
    }

    @PatchMapping("/registrations/{registrationId}/reject")
    @PreAuthorize("hasAnyRole('ORGANIZER', 'ADMIN')")
    public ResponseEntity<GenericResponse> rejectRegistration(
            @PathVariable String registrationId,
            @AuthenticationPrincipal UserPrincipal userDetails) {
        var actorId = userDetails.userId();
        log.info("Rejecting registration: {} by actor: {}", registrationId, actorId);
        return ResponseEntity.ok(registrationService.rejectRegistration(actorId, registrationId));
    }
}
