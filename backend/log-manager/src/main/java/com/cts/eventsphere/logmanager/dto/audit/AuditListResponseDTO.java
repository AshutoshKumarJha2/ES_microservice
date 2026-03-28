package com.cts.eventsphere.logmanager.dto.audit;

import java.util.List;

/**
 * AuditListResponseDTO is a data transfer object that represents a paginated
 * response containing a list of system audit logs.
 * It provides metadata regarding the current page and total records available.
 *
 * @author test-in-prod-10x
 * @version 1.0
 * @since 2026-03-08
 *
 * @param audits        The list of {@link AuditResponseDTO} records for the current page.
 * @param page          The current page index (zero-based).
 * @param size          The number of records per page.
 * @param totalElements The total number of audit records across all pages.
 * @param totalPages    The total number of pages available.
 */
public record AuditListResponseDTO(
        List<AuditResponseDTO> audits,
        int page,
        int size,
        long totalElements,
        int totalPages
) {
}