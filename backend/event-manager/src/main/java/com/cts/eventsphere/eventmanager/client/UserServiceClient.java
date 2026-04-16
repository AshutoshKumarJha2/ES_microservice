package com.cts.eventsphere.eventmanager.client;

import com.cts.eventsphere.eventmanager.config.ServiceFeignConfig;
import com.cts.eventsphere.eventmanager.dto.user.UserDetailsDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

/**
 * Feign client for fetching user profile details from the auth-manager service.
 *
 * <p>Calls the bulk {@code POST /users/userdetails} endpoint, which is restricted
 * to the {@code SYS_EVENT_MGR} service role. The service token is attached
 * automatically by {@link ServiceFeignConfig}.</p>
 *
 * <p>Used by {@code RegistrationServiceImpl} to enrich registration responses
 * with attendee information.</p>
 *
 * @author test-in-prod-10x
 * @version 1.0
 * @since 2026-04-15
 */
@FeignClient(name = "auth-manager", contextId = "userServiceClient",
        path = "/users", configuration = ServiceFeignConfig.class)
public interface UserServiceClient {

    /**
     * Retrieves profile details for a batch of user IDs (max 100).
     *
     * @param userIds the list of user UUIDs to look up
     * @return a list of {@link UserDetailsDto} for the matched users
     */
    @PostMapping("/userdetails")
    List<UserDetailsDto> getUserDetails(@RequestBody List<String> userIds);
}
