package com.cts.eventsphere.eventmanager.service.impl;

import com.cts.eventsphere.eventmanager.client.AuditClient;
import com.cts.eventsphere.eventmanager.dto.audit.AuditAction;
import com.cts.eventsphere.eventmanager.dto.audit.AuditLogRequestDTO;
import com.cts.eventsphere.eventmanager.service.AuditService;
import feign.FeignException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * AuditServiceImpl is the concrete implementation of {@link AuditService}.
 * It builds an {@link AuditLogRequestDTO} from the provided parameters and
 * forwards it to the log-manager microservice via {@link AuditClient}.
 * All {@link feign.FeignException}s are caught and logged as warnings so that
 * audit logging never interrupts the triggering business operation.
 *
 * @author test-in-prod-10x
 * @version 1.0
 * @since 2026-03-28
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuditServiceImpl implements AuditService {

    private final AuditClient auditClient;

    /**
     * {@inheritDoc}
     *
     * <p>Constructs an {@link AuditLogRequestDTO} using the entity's simple class name
     * as the entity name, then delegates to {@link AuditClient#createAudit(AuditLogRequestDTO)}.
     * Any {@link feign.FeignException} is caught and logged; it is never re-thrown.</p>
     *
     * @param userId      The ID of the user performing the action.
     * @param action      The {@link AuditAction} representing the type of operation performed.
     * @param entityClass The class of the entity affected (e.g. {@code Event.class}).
     * @param entityId    The unique identifier of the affected entity.
     */
    @Override
    public void logAudit(String userId, AuditAction action, Class<?> entityClass, String entityId) {
        logAudit(userId, action, entityClass.getSimpleName(), entityId);
    }

    /**
     * {@inheritDoc}
     *
     * <p>Directly uses the provided {@code entityName} string when a {@link Class} object
     * is not available (e.g. in a global exception handler). Delegates to
     * {@link AuditClient#createAudit(AuditLogRequestDTO)}.
     * Any exception is caught and logged; it is never re-thrown.</p>
     *
     * @param userId     The ID of the user performing the action.
     * @param action     The {@link AuditAction} representing the type of operation performed.
     * @param entityName The name of the entity type affected.
     * @param entityId   The unique identifier or request URI of the affected resource.
     */
    @Override
    public void logAudit(String userId, AuditAction action, String entityName, String entityId) {
        var dto = new AuditLogRequestDTO(userId, action, entityId, entityName);
        log.debug("Sending audit request: userId={}, payload={}", userId, dto);
        try {
            auditClient.createAudit(dto);
            log.debug("Audit logged successfully: userId={}, action={}, entity={}, entityId={}",
                    userId, action, entityName, entityId);
        } catch (FeignException e) {
            log.warn("Audit call rejected by log-manager: userId={}, action={}, entity={}, entityId={}" +
                            " | HTTP status={}, response body={}",
                    userId, action, entityName, entityId,
                    e.status(), e.contentUTF8());
        } catch (Exception e) {
            log.warn("Audit call failed (connection/unexpected error): userId={}, action={}, entity={}, entityId={}" +
                            " | error={}",
                    userId, action, entityName, entityId, e.getMessage());
        }
    }
}
