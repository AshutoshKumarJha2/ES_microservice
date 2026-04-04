package com.cts.eventsphere.iamservice.client;

import com.cts.eventsphere.iamservice.dto.audit.AuditLogRequestDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

/**
 * [Detailed description of the class's responsibility]
 * * @author 2480010
 *
 * @version 1.0
 * @since 31-03-2026
 */
@FeignClient(name = "log-manager",contextId = "auditClient",path = "/audits")
public interface AuditClient {

    @PostMapping
    ResponseEntity<Void> createAudit(@RequestBody AuditLogRequestDTO dto);
}
