package com.cts.eventsphere.logmanager.auth.service;

import com.cts.eventsphere.logmanager.auth.dto.UserPrincipal;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@Slf4j
public class ServiceTokenValidator {
    private final PublicKeyProvider publicKeyProvider;

    public UserPrincipal validate(String token) {
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(publicKeyProvider.getPublicKey())
                    .build().parseClaimsJws(token).getBody();
            String tokenType = claims.get("type", String.class);
            if (!"SERVICE".equals(tokenType))
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not a service token");
            String subject = claims.getSubject();
            @SuppressWarnings("unchecked")
            List<String> roles = claims.get("roles", List.class);
            List<SimpleGrantedAuthority> authorities = roles.stream()
                    .map(r -> new SimpleGrantedAuthority("ROLE_" + r)).collect(Collectors.toList());
            return new UserPrincipal(subject, roles.get(0), authorities);
        } catch (JwtException e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid service token: " + e.getMessage());
        }
    }
}
