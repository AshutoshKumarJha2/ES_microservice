package com.cts.eventsphere.expensemanager.service;

import com.cts.eventsphere.expensemanager.client.AuditClient;
import com.cts.eventsphere.expensemanager.dto.audit.AuditAction;
import com.cts.eventsphere.expensemanager.dto.audit.AuditLogRequestDto;
import com.cts.eventsphere.expensemanager.service.impl.AuditServiceImpl;
import feign.FeignException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuditServiceImplTest {

    @Mock
    private AuditClient auditClient;

    @InjectMocks
    private AuditServiceImpl auditService;

    @Test
    void logAudit_withStringEntityName_callsAuditClient() {
        auditService.logAudit("user-1", AuditAction.CREATE, "Budget", "budget-1");

        verify(auditClient).createAudit(any(AuditLogRequestDto.class));
    }

    @Test
    void logAudit_withClassEntityType_delegatesToStringOverload() {
        auditService.logAudit("user-1", AuditAction.READ, Budget.class, "budget-1");

        verify(auditClient).createAudit(any(AuditLogRequestDto.class));
    }

    @Test
    void logAudit_feignException_doesNotPropagate() {
        doThrow(mock(FeignException.class)).when(auditClient).createAudit(any());

        auditService.logAudit("user-1", AuditAction.DELETE, "Expense", "exp-1");

        verify(auditClient).createAudit(any(AuditLogRequestDto.class));
    }

    @Test
    void logAudit_genericException_doesNotPropagate() {
        doThrow(new RuntimeException("Connection refused")).when(auditClient).createAudit(any());

        auditService.logAudit("user-1", AuditAction.UPDATE, "Budget", "budget-2");

        verify(auditClient).createAudit(any(AuditLogRequestDto.class));
    }

    // Inner class to allow Class<?> overload to be tested with a stable name
    static class Budget {}
}
