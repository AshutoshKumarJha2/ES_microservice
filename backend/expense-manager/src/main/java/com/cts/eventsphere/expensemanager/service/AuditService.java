package com.cts.eventsphere.expensemanager.service;

import com.cts.eventsphere.expensemanager.dto.audit.AuditAction;

public interface AuditService {

    void logAudit(String userId, AuditAction action, Class<?> entityClass, String entityId);

    void logAudit(String userId, AuditAction action, String entityName, String entityId);
}
