package com.cts.eventsphere.logmanager.dto.audit;

import com.cts.eventsphere.logmanager.model.data.AuditAction;

public record AuditLogRequestDTO(
        AuditAction action,
        String entityId,
        String entityName
) {
}
