package com.cts.eventsphere.iamservice.config;

import com.cts.eventsphere.iamservice.security.JwtUtil;
import feign.RequestInterceptor;
import feign.RequestTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * FeignAuthInterceptor is a Feign {@link RequestInterceptor} that automatically
 * attaches a system-level JWT to every outgoing Feign request made by this service.
 *
 * <p>Instead of propagating the end-user's token, this interceptor generates a
 * short-lived access token on behalf of a dedicated internal system identity
 * ({@code system.user-id} / {@code system.role}).  This keeps service-to-service
 * calls authenticated without leaking user credentials across service boundaries.</p>
 *
 * @author test-in-prod-10x
 * @version 2.0
 * @since 2026-03-28
 */
@Component
public class FeignAuthInterceptor implements RequestInterceptor {

    private final JwtUtil jwtUtil;

    /** The pseudo-UUID that represents this service in the JWT {@code userId} claim. */
    @Value("${system.user-id:00000000-0000-0000-0000-000000000000}")
    private String systemUserId;

    /** The role embedded in the system token (must be recognisable by downstream services). */
    @Value("${system.role:ADMIN}")
    private String systemRole;

    public FeignAuthInterceptor(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    /**
     * Intercepts every outgoing Feign request and appends a freshly generated
     * system {@code Authorization: Bearer <token>} header.
     *
     * @param template The {@link RequestTemplate} for the outgoing Feign request.
     */
    @Override
    public void apply(RequestTemplate template) {
        String systemToken = jwtUtil.generateAccessToken(systemUserId, systemRole);
        template.header("Authorization", "Bearer " + systemToken);
    }
}