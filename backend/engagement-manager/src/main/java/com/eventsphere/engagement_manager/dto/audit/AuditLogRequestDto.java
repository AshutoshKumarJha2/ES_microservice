package com.eventsphere.engagement_manager.dto.audit;

public record AuditLogRequestDto(
        AuditAction action,
        String entityId,
        String entityName
) {
}
