package com.eventsphere.engagement_manager.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "log-manager", contextId = "logServiceClient", path = "/notifications")
public interface LogServiceClient {

    @PostMapping("/send")
    ResponseEntity<Void> sendNotification(
            @RequestParam String userId,
            @RequestParam String message,
            @RequestParam String category
    );
}
