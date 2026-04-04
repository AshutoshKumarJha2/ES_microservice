package com.cts.eventsphere.logmanager.model.data;

/**
 * AuditAction defines the set of standardized actions recorded in the system audit logs.
 * It encompasses data lifecycle events, security-related activities, and administrative
 * state transitions to ensure full system traceability.
 *
 * @author test-in-prod-10x
 * @version 1.0
 * @since 2026-03-08
 */
public enum AuditAction {
    // --- Standard CRUD Operations ---
    /** Action recorded when a new resource is created. */
    CREATE,
    /** Action recorded when an existing resource is updated. */
    UPDATE,
    /** Action recorded when a resource is logically or physically deleted. */
    DELETE,
    /** Action recorded when a resource is accessed or viewed (for sensitive data). */
    READ,

    // --- Registration & Workflow States ---
    /** Action recorded when a registration or request is approved. */
    APPROVE,
    /** Action recorded when a registration or request is rejected. */
    REJECT,
    /** Action recorded when an attendee cancels their own registration. */
    CANCEL,
    /** Action recorded when a previously cancelled or rejected item is reinstated. */
    RESTORE,

    // --- Security & Access Control ---
    /** Action recorded when a new user successfully registers. */
    REGISTRATION_SUCCESS,
    /** Action recorded when a user registration attempt fails (e.g., due to validation errors). */
    REGISTRATON_FAILURE,
    /** Action recorded upon a successful user authentication. */
    LOGIN_SUCCESS,
    /** Action recorded upon a failed authentication attempt. */
    LOGIN_FAILURE,
    /** Action recorded when a user explicitly logs out. */
    LOGOUT,
    /** Action recorded when user permissions or roles are modified. */
    PERMISSION_CHANGE,
    /** Action recorded when an unauthorized access attempt is detected. */
    ACCESS_DENIED,

    // --- System & Administrative ---
    /** Action recorded when system configurations are modified. */
    CONFIG_CHANGE,
    /** Action recorded when data is exported from the system. */
    EXPORT,
    /** Action recorded when a batch process or background job is triggered. */
    SYSTEM_JOB_EXECUTION
}