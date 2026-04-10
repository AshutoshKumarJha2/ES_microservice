package com.cts.eventsphere.expensemanager.client;

import com.cts.eventsphere.expensemanager.config.ServiceFeignConfig;
import com.cts.eventsphere.expensemanager.dto.audit.AuditLogRequestDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "log-manager", contextId = "auditClient", path = "/audits", configuration = ServiceFeignConfig.class)
public interface AuditClient {

    @PostMapping
    ResponseEntity<Void> createAudit(@RequestBody AuditLogRequestDto dto);
}
