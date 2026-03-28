package com.cts.eventsphere.eventmanager.service;

import com.cts.eventsphere.eventmanager.dto.audit.AuditAction;

/**
 * AuditService is responsible for recording audit trail entries for significant
 * actions performed within the event-manager. It delegates persistence to the
 * log-manager microservice via a Feign client.
 * All implementations must ensure that failures to reach the log-manager never
 * propagate to the calling business operation.
 *
 * @author test-in-prod-10x
 * @version 1.0
 * @since 2026-03-28
 */
public interface AuditService {

    /**
     * Records an audit log entry for the given actor, action, entity type, and entity ID.
     * Failures are swallowed so the caller's operation is never interrupted.
     *
     * @param userId      The ID of the user performing the action.
     * @param action      The {@link AuditAction} representing the type of operation performed.
     * @param entityClass The class of the entity affected (e.g. {@code Event.class},
     *                    {@code Schedule.class}). Its simple name is used as the entity name.
     * @param entityId    The unique identifier of the affected entity.
     */
    void logAudit(String userId, AuditAction action, Class<?> entityClass, String entityId);

    /**
     * Records an audit log entry using a plain string entity name.
     * Intended for use in contexts where no {@link Class} object is available,
     * such as a global exception handler.
     * Failures are swallowed so the caller's operation is never interrupted.
     *
     * @param userId     The ID of the user performing the action.
     * @param action     The {@link AuditAction} representing the type of operation performed.
     * @param entityName The name of the entity type affected (e.g. {@code "Event"}, {@code "Ticket"}).
     * @param entityId   The unique identifier or request URI of the affected resource.
     */
    void logAudit(String userId, AuditAction action, String entityName, String entityId);
}
