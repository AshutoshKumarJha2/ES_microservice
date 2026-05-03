package com.cts.eventsphere.iamservice.dto.audit;

/**
 * [Detailed description of the class's responsibility]
 * * @author 2480010
 *
 * @version 1.0
 * @since 31-03-2026
 */
public record AuditLogRequestDTO(
        String userId,
        AuditAction action,
        String entityId,
        String entityName
) {
}
