package com.cts.eventsphere.logmanager.dto.audit;

import lombok.Builder;

import java.time.LocalDateTime;

/**
 * AuditResponseDTO is a data transfer object representing a single audit log entry.
 * It provides detailed information about a specific action taken by a user within the system.
 *
 * @author test-in-prod-10x
 * @version 1.0
 * @since 2026-03-08
 *
 * @param auditId    The unique identifier for the audit record.
 * @param userId     The unique identifier of the user who performed the action.
 * @param action     The type of action recorded (e.g., CREATE, CANCEL, APPROVE).
 * @param entityId   The unique identifier of the specific entity instance.
 * @param entityName The descriptive name of the entity or the class name.
 * @param timeStamp  The date and time when the action occurred.
 */
@Builder
public record AuditResponseDTO(
        String auditId,
        String userId,
        String action,
        String entityId,
        String entityName,
        LocalDateTime timeStamp
) {
}