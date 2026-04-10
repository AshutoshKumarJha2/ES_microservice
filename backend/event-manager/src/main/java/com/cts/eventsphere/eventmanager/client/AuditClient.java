package com.cts.eventsphere.eventmanager.client;

import com.cts.eventsphere.eventmanager.config.ServiceFeignConfig;
import com.cts.eventsphere.eventmanager.dto.audit.AuditLogRequestDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

/**
 * AuditClient is a Feign client that mirrors the audit endpoint exposed by
 * {@code AuditController} in the log-manager service.
 * It is used to persist audit log entries for every significant action performed
 * within the event-manager.
 *
 * <p>The incoming {@code Authorization} header is automatically forwarded to the
 * log-manager via {@link com.cts.eventsphere.eventmanager.config.FeignAuthInterceptor},
 * allowing the log-manager to authenticate the request and resolve the acting user.</p>
 *
 * <p>Calls are fire-and-forget: a failure to reach the log-manager must never
 * interrupt the triggering business operation. Callers are responsible for catching
 * {@link feign.FeignException} and logging it appropriately.</p>
 *
 * @author test-in-prod-10x
 * @version 1.0
 * @since 2026-03-28
 */
@FeignClient(name = "log-manager", contextId = "auditClient", path = "/audits",
        configuration = ServiceFeignConfig.class)
public interface AuditClient {

    /**
     * Submits an audit log entry to the log-manager.
     * The acting user is resolved from the JWT forwarded in the {@code Authorization} header.
     *
     * @param dto The {@link AuditLogRequestDTO} containing the action performed, the entity ID,
     *            and the entity name to be recorded in the audit trail.
     * @return A {@link ResponseEntity} with HTTP 201 (Created) on success.
     */
    @PostMapping
    ResponseEntity<Void> createAudit(@RequestBody AuditLogRequestDTO dto);
}
