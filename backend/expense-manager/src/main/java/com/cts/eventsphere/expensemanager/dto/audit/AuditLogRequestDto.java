package com.cts.eventsphere.expensemanager.dto.audit;

public record AuditLogRequestDto(
        String userId,
        AuditAction action,
        String entityId,
        String entityName
) {
}
