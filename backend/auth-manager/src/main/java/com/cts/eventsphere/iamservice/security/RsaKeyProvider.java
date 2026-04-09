package com.cts.eventsphere.iamservice.security;

import org.springframework.stereotype.Component;

import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.NoSuchAlgorithmException;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.util.Base64;

/**
 * Generates and holds the RSA-2048 key pair used to sign and verify service tokens.
 *
 * <p>The key pair is generated fresh at application startup. The private key signs
 * outgoing service JWTs; the public key is exposed via
 * {@code GET /auth/service-token/public-key} so downstream services can cache it
 * and validate incoming service tokens locally without a network round-trip.</p>
 *
 * <p>Keys are ephemeral — regenerated on each restart. All downstream services
 * fetch the public key at their own startup, so there is no stale-key problem as
 * long as auth-manager starts before its dependants.</p>
 *
 * @author test-in-prod-10x
 * @version 1.0
 * @since 2026-04-06
 */
@Component
public class RsaKeyProvider {

    private final RSAPrivateKey privateKey;
    private final RSAPublicKey publicKey;

    public RsaKeyProvider() throws NoSuchAlgorithmException {
        KeyPairGenerator gen = KeyPairGenerator.getInstance("RSA");
        gen.initialize(2048);
        KeyPair pair = gen.generateKeyPair();
        this.privateKey = (RSAPrivateKey) pair.getPrivate();
        this.publicKey  = (RSAPublicKey)  pair.getPublic();
    }

    public RSAPrivateKey getPrivateKey() {
        return privateKey;
    }

    public RSAPublicKey getPublicKey() {
        return publicKey;
    }

    /**
     * Returns the public key as a PEM-encoded X.509 SubjectPublicKeyInfo string.
     * Safe to expose over HTTP — contains no secret material.
     */
    public String getPublicKeyPem() {
        byte[] encoded = publicKey.getEncoded();
        String base64 = Base64.getMimeEncoder(64, new byte[]{'\n'}).encodeToString(encoded);
        return "-----BEGIN PUBLIC KEY-----\n" + base64 + "\n-----END PUBLIC KEY-----\n";
    }
}
