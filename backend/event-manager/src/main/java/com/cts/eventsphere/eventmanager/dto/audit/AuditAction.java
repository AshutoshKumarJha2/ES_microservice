package com.cts.eventsphere.eventmanager.dto.audit;

/**
 * AuditAction defines the set of standardized actions that can be recorded in the
 * system audit logs. It mirrors {@code com.cts.eventsphere.logmanager.model.data.AuditAction}
 * from the log-manager service to avoid a compile-time dependency on that module.
 * It encompasses data lifecycle events, security-related activities, and administrative
 * state transitions to ensure full system traceability.
 *
 * @author test-in-prod-10x
 * @version 1.0
 * @since 2026-03-28
 */
public enum AuditAction {
    // --- Standard CRUD Operations ---
    CREATE, READ, UPDATE, DELETE,

    // --- Registration & Workflow States ---
    APPROVE, REJECT, CANCEL, RESTORE,

    // --- Security & Access Control ---
    REGISTRATION_SUCCESS, REGISTRATON_FAILURE,
    LOGIN_SUCCESS, LOGIN_FAILURE, LOGOUT,
    PERMISSION_CHANGE, ACCESS_DENIED,

    // --- System & Administrative ---
    CONFIG_CHANGE, EXPORT, SYSTEM_JOB_EXECUTION
}
