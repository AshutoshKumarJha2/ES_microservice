package com.cts.eventsphere.vendormanager.auth.service;

import com.cts.eventsphere.vendormanager.auth.client.ServiceTokenClient;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import java.security.KeyFactory;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;

/**
 * Fetches and caches the RSA public key from auth-manager at application startup.
 *
 * <p>Service tokens are validated locally using this cached key — no network round-trip
 * is needed per request. If auth-manager is unreachable at startup the service will
 * fail fast, since token validation cannot function without the key.</p>
 *
 * <p>The cached key can be invalidated and re-fetched at runtime via {@link #refresh()},
 * allowing downstream services to self-heal after an auth-manager restart that rotates
 * the RSA key pair.</p>
 *
 * @author test-in-prod-10x
 * @version 1.0
 * @since 2026-04-06
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class PublicKeyProvider {
    private final ServiceTokenClient serviceTokenClient;
    private volatile RSAPublicKey cachedPublicKey;

    @PostConstruct
    public void init() { fetchAndCache(); }

    /**
     * Returns the cached RSA public key, fetching it from auth-manager if not yet loaded.
     *
     * @return the RSA public key used to verify service and user tokens
     */
    public RSAPublicKey getPublicKey() {
        if (cachedPublicKey == null) fetchAndCache();
        return cachedPublicKey;
    }

    /**
     * Forces a re-fetch of the RSA public key from auth-manager,
     * replacing the cached key. Called automatically on token validation
     * failure to recover from auth-manager key rotation or restart.
     */
    public void refresh() {
        cachedPublicKey = null;
        fetchAndCache();
    }

    private synchronized void fetchAndCache() {
        try {
            String pem = serviceTokenClient.getPublicKey();
            this.cachedPublicKey = parsePem(pem);
            log.info("RSA public key fetched from auth-manager and cached");
        } catch (Exception e) {
            log.error("Failed to fetch RSA public key from auth-manager: {}", e.getMessage());
            throw new IllegalStateException("Cannot start: RSA public key unavailable", e);
        }
    }

    private RSAPublicKey parsePem(String pem) throws Exception {
        String stripped = pem.replace("-----BEGIN PUBLIC KEY-----", "")
                .replace("-----END PUBLIC KEY-----", "").replaceAll("\\s", "");
        byte[] decoded = Base64.getDecoder().decode(stripped);
        return (RSAPublicKey) KeyFactory.getInstance("RSA").generatePublic(new X509EncodedKeySpec(decoded));
    }
}
