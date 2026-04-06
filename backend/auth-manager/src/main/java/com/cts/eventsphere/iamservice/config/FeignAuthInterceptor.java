package com.cts.eventsphere.iamservice.config;

import com.cts.eventsphere.iamservice.model.data.ServiceRoles;
import com.cts.eventsphere.iamservice.security.ServiceTokenUtil;
import feign.RequestInterceptor;
import feign.RequestTemplate;
import org.springframework.stereotype.Component;

/**
 * Feign {@link RequestInterceptor} that attaches a short-lived RSA-signed service token
 * to every outgoing Feign request made by auth-manager (e.g. to log-manager for audits).
 *
 * <p>Replaced the legacy system-user HMAC JWT with a proper service token that carries
 * {@link ServiceRoles#SYSTEM} and {@link ServiceRoles#SYS_AUTH_MGR}.
 * Downstream services validate the token locally using the cached RSA public key.</p>
 *
 * @author test-in-prod-10x
 * @version 2.0
 * @since 2026-04-06
 */
@Component
public class FeignAuthInterceptor implements RequestInterceptor {

    private final ServiceTokenUtil serviceTokenUtil;

    public FeignAuthInterceptor(ServiceTokenUtil serviceTokenUtil) {
        this.serviceTokenUtil = serviceTokenUtil;
    }

    @Override
    public void apply(RequestTemplate template) {
        String token = serviceTokenUtil.generateServiceToken("auth-manager", ServiceRoles.SYS_AUTH_MGR);
        template.header("Authorization", "Bearer " + token);
    }
}
