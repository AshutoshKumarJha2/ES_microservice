package com.eventsphere.engagement_manager.dto.audit;

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
