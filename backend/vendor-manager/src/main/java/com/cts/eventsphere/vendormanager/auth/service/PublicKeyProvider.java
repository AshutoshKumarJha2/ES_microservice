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

@Component
@RequiredArgsConstructor
@Slf4j
public class PublicKeyProvider {
    private final ServiceTokenClient serviceTokenClient;
    private volatile RSAPublicKey cachedPublicKey;

    @PostConstruct
    public void init() { fetchAndCache(); }

    public RSAPublicKey getPublicKey() {
        if (cachedPublicKey == null) fetchAndCache();
        return cachedPublicKey;
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
