package com.cts.eventsphere.logmanager.dto.audit;

import com.cts.eventsphere.logmanager.model.data.AuditAction;

public record AuditLogRequestDTO(
        String userId,
        AuditAction action,
        String entityId,
        String entityName
) {
}
