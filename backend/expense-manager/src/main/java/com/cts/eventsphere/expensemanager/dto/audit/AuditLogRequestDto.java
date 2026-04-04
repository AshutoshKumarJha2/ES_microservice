package com.cts.eventsphere.expensemanager.dto.audit;

public record AuditLogRequestDto(
        AuditAction action,
        String entityId,
        String entityName
) {
}
