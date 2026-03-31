package com.cts.eventsphere.eventmanager.service;

import com.cts.eventsphere.eventmanager.client.AuditClient;
import com.cts.eventsphere.eventmanager.dto.audit.AuditAction;
import com.cts.eventsphere.eventmanager.dto.audit.AuditLogRequestDTO;
import com.cts.eventsphere.eventmanager.model.Event;
import com.cts.eventsphere.eventmanager.service.impl.AuditServiceImpl;
import feign.FeignException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuditServiceImplTest {

    @Mock private AuditClient auditClient;
    @InjectMocks private AuditServiceImpl auditService;

    private static final String USER_ID   = "user-001";
    private static final String ENTITY_ID = "entity-001";

    // -------------------------------------------------------------------------
    // logAudit(userId, action, Class, entityId)
    // -------------------------------------------------------------------------
    @Nested
    @DisplayName("logAudit(userId, action, Class, entityId)")
    class LogAuditWithClass {

        @Test
        @DisplayName("delegates to string overload using class simple name – calls auditClient")
        void logAudit_withClass_delegatesToStringOverload() {
            auditService.logAudit(USER_ID, AuditAction.CREATE, Event.class, ENTITY_ID);

            verify(auditClient).createAudit(any(AuditLogRequestDTO.class));
        }
    }

    // -------------------------------------------------------------------------
    // logAudit(userId, action, String, entityId)
    // -------------------------------------------------------------------------
    @Nested
    @DisplayName("logAudit(userId, action, String, entityId)")
    class LogAuditWithString {

        @Test
        @DisplayName("happy path – calls auditClient.createAudit successfully")
        void logAudit_happyPath() {
            auditService.logAudit(USER_ID, AuditAction.READ, "Event", ENTITY_ID);

            verify(auditClient).createAudit(any(AuditLogRequestDTO.class));
        }

        @Test
        @DisplayName("swallows FeignException – does not propagate to caller")
        void logAudit_feignException_swallowed() {
            FeignException fe = mock(FeignException.class);
            when(fe.status()).thenReturn(503);
            when(fe.contentUTF8()).thenReturn("service unavailable");
            doThrow(fe).when(auditClient).createAudit(any());

            // must not throw
            auditService.logAudit(USER_ID, AuditAction.UPDATE, "Event", ENTITY_ID);

            verify(auditClient).createAudit(any());
        }

        @Test
        @DisplayName("swallows generic Exception – does not propagate to caller")
        void logAudit_genericException_swallowed() {
            doThrow(new RuntimeException("connection refused")).when(auditClient).createAudit(any());

            // must not throw
            auditService.logAudit(USER_ID, AuditAction.DELETE, "Event", ENTITY_ID);

            verify(auditClient).createAudit(any());
        }
    }
}
