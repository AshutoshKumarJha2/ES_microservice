package com.cts.eventsphere.eventmanager.dto.audit;

/**
 * AuditLogRequestDTO is the request body sent to the log-manager's
 * {@code POST /api/v1/audits} endpoint.
 * It mirrors {@code com.cts.eventsphere.logmanager.dto.audit.AuditLogRequestDTO}
 * from the log-manager service to avoid a compile-time dependency on that module.
 *
 * @param action     The {@link AuditAction} representing the operation that was performed.
 * @param entityId   The unique identifier of the entity that was acted upon.
 * @param entityName The simple class name of the entity (e.g. {@code "Event"}, {@code "Schedule"}).
 *
 * @author test-in-prod-10x
 * @version 1.0
 * @since 2026-03-28
 */
public record AuditLogRequestDTO(
        String userId,
        AuditAction action,
        String entityId,
        String entityName
) {
}
