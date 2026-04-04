package com.eventsphere.engagement_manager.service;

import com.eventsphere.engagement_manager.dto.audit.AuditAction;

public interface AuditService {

    void logAudit(String userId, AuditAction action, Class<?> entityClass, String entityId);

    void logAudit(String userId, AuditAction action, String entityName, String entityId);
}
