package com.eventsphere.engagement_manager.client;

import com.eventsphere.engagement_manager.dto.audit.AuditLogRequestDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "log-manager", contextId = "auditClient", path = "/audits")
public interface AuditClient {

    @PostMapping
    ResponseEntity<Void> createAudit(@RequestBody AuditLogRequestDto dto);
}
