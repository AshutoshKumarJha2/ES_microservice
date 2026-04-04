package com.cts.eventsphere.logmanager.controller;

import com.cts.eventsphere.logmanager.auth.dto.UserPrincipal;
import com.cts.eventsphere.logmanager.dto.audit.AuditListResponseDTO;
import com.cts.eventsphere.logmanager.dto.audit.AuditLogRequestDTO;
import com.cts.eventsphere.logmanager.dto.shared.GenericResponse;
import com.cts.eventsphere.logmanager.service.AuditService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * AuditController class is responsible for handling HTTP requests related to system audit logs.
 * It provides endpoints for retrieving audit trails for administrative review.
 *
 * @author test-in-prod-10x
 * @version 1.0
 * @since 2026-03-16
 */
@RestController
@RequestMapping("/audits")
@RequiredArgsConstructor
@Slf4j
public class AuditController {
    private final AuditService auditService;

    /**
     * Retrieves a paginated list of all system audit logs.
     * Accessible only by Admins.
     *
     * @param size The number of records per page (defaults to 10).
     * @param page The page number to retrieve (defaults to 0).
     * @return A {@link ResponseEntity} containing {@link AuditListResponseDTO} with the list of audits.
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AuditListResponseDTO> getAllAudits(
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "0") int page
    ){
        log.info("Getting all audits, page {}, size {}", page, size);
        return ResponseEntity.ok(auditService.getAudits(size, page));
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<GenericResponse> createAudit(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody AuditLogRequestDTO dto
            ){
    auditService.logAudit(userPrincipal.userId(), dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(new GenericResponse("Success"));
    }
}