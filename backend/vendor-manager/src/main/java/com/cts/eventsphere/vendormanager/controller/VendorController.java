package com.cts.eventsphere.vendormanager.controller;


import com.cts.eventsphere.vendormanager.dto.vendor.VendorRequestDto;
import com.cts.eventsphere.vendormanager.dto.vendor.VendorResponseDto;
import com.cts.eventsphere.vendormanager.service.VendorService;
import com.cts.eventsphere.vendormanager.auth.dto.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Rest Controller for Vendor Entity management.
 * Provides endpoints for onboarding, retrieving, updating, and removing vendor profiles.
 * Adheres to mandatory coding standards for maintainability and professional documentation[cite: 1, 2, 3].
 *
 * @author 2480177
 * @version 1.0
 * @since 03-03-2026
 */

@RestController
@RequestMapping("/api/v1/vendors")
@Slf4j
@RequiredArgsConstructor
@Validated
public class VendorController {

    private final VendorService vendorService;

    /**
     * Initiates a new vendor record in the system.
     * Restricted to users with the 'VENDOR' role for self-onboarding or registration[cite: 48, 49].
     *
     * @param user The currently authenticated user's details representing the actor.
     * @param request the vendor details to be created, validated by @Valid [cite: 54]
     * @return the created vendor response DTO wrapped in a ResponseEntity with 201 Created status [cite: 55]
     */
    @PostMapping
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<VendorResponseDto> create(@AuthenticationPrincipal UserPrincipal user, @Valid @RequestBody VendorRequestDto request) {
        var actorId = user.userId();
        log.info("REST request to create vendor={} by actorId={}", request, actorId);
        VendorResponseDto response = vendorService.createVendor(user.userId(), request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * Retrieves a single vendor by their unique identifier.
     * Provides comprehensive profile details for the specified vendor ID[cite: 48, 49].
     *
     * @param user The currently authenticated user's details representing the actor.
     * @param id the unique identifier of the vendor [cite: 54]
     * @return the vendor details wrapped in a ResponseEntity with 200 OK status [cite: 55]
     */
    @GetMapping("/{id}")
    public ResponseEntity<VendorResponseDto> getById(@AuthenticationPrincipal UserPrincipal user, @PathVariable String id) {
        var actorId = user.userId();
        log.info("REST request to fetch vendor by ID={} by actorId={}", id, actorId);
        return ResponseEntity.ok(vendorService.getVendorById(user.userId(), id));
    }

    /**
     * Fetches a complete list of all registered vendors in the system.
     * Useful for administrative overview and event planning[cite: 48, 49].
     *
     * @param user The currently authenticated user's details representing the actor.
     * @return a list of all vendor response DTOs wrapped in a ResponseEntity [cite: 55]
     */
    @GetMapping
    public ResponseEntity<List<VendorResponseDto>> getAll(@AuthenticationPrincipal UserPrincipal user) {
        var actorId = user.userId();
        log.info("REST request to fetch all vendors by actorId={}",actorId);
        return ResponseEntity.ok(vendorService.getAllVendors(user.userId()));
    }

    /**
     * Performs a full update of an existing vendor's profile information.
     * Restricted to the 'VENDOR' role to ensure data integrity[cite: 48, 49].
     *
     * @param user The currently authenticated user's details representing the actor.
     * @param id the unique identifier of the vendor to update [cite: 54]
     * @param request the updated vendor details wrapped in a DTO [cite: 54]
     * @return the updated vendor response DTO wrapped in a ResponseEntity [cite: 55]
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<VendorResponseDto> update(
            @AuthenticationPrincipal UserPrincipal user,
            @PathVariable String id,
            @Valid @RequestBody VendorRequestDto request) {
        var actorId = user.userId();
        log.info("REST request to update vendor with ID={} by actorId={}", id, actorId);
        return ResponseEntity.ok(vendorService.updateVendor(user.userId(), id, request));
    }

    /**
     * Permanently removes a vendor record from the system.
     * Restricted to users with 'VENDOR' or 'ADMIN' roles[cite: 48, 49].
     *
     * @param user The currently authenticated user's details representing the actor.
     * @param id the unique identifier of the vendor to remove [cite: 54]
     * @return ResponseEntity with 204 No Content status on successful deletion [cite: 55]
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('VENDOR','ADMIN')")
    public ResponseEntity<Void> delete(@AuthenticationPrincipal UserPrincipal user, @PathVariable String id) {
        var actorId = user.userId();
        log.info("Rest request to delete vendor with ID={} with actorId={}", id, actorId);
        vendorService.deleteVendor(user.userId(), id);
        return ResponseEntity.noContent().build();
    }
}
