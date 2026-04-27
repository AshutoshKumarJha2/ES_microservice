package com.eventsphere.engagement_manager.dto.audit;

public record AuditLogRequestDto(
        String userId,
        AuditAction action,
        String entityId,
        String entityName
) {
}
