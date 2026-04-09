package com.cts.eventsphere.iamservice.config;

import com.cts.eventsphere.iamservice.model.data.ServiceRoles;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

/**
 * Binds the {@code service-registry} configuration block to a map of registered services.
 *
 * <p>Each entry maps a service name (e.g. {@code "event-manager"}) to its
 * BCrypt-hashed secret and server-assigned {@link ServiceRoles}.
 * Auth-manager uses this registry to validate service token requests —
 * a caller cannot request a role that is not pre-configured for its name.</p>
 *
 * <p>Example configuration:</p>
 * <pre>
 * service-registry:
 *   event-manager:
 *     secret-hash: "$2a$10$..."
 *     role: SYS_EVENT_MGR
 * </pre>
 *
 * @author test-in-prod-10x
 * @version 1.0
 * @since 2026-04-06
 */
@Component
@ConfigurationProperties(prefix = "service-registry")
public class ServiceRegistryProperties {

    private final Map<String, ServiceRegistryEntry> services = new HashMap<>();

    public Map<String, ServiceRegistryEntry> getServices() {
        return services;
    }

    /**
     * A single entry in the service registry.
     */
    public static class ServiceRegistryEntry {
        /** BCrypt hash of the service's pre-shared secret. */
        private String secretHash;
        /** The {@link ServiceRoles} assigned to this service — server-side only. */
        private ServiceRoles role;

        public String getSecretHash() { return secretHash; }
        public void setSecretHash(String secretHash) { this.secretHash = secretHash; }

        public ServiceRoles getRole() { return role; }
        public void setRole(ServiceRoles role) { this.role = role; }
    }
}
