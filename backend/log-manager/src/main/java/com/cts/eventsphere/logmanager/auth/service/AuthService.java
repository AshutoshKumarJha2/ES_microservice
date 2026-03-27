package com.cts.eventsphere.logmanager.auth.service;

import com.cts.eventsphere.logmanager.auth.client.IAMClient;
import com.cts.eventsphere.logmanager.auth.dto.UserPrincipal;
import com.cts.eventsphere.logmanager.auth.dto.ValidateResponse;
import feign.FeignException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final IAMClient iamClient;

    public UserPrincipal validate(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing or invalid Authorization header");
        }

        try {
            ResponseEntity<ValidateResponse> response = iamClient.validate(authHeader);

            if (response.getStatusCode() != HttpStatus.OK || response.getBody() == null) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Token validation failed");
            }

            ValidateResponse body = response.getBody();
            var authority = new SimpleGrantedAuthority("ROLE_" + body.getUserRole());

            return new UserPrincipal(body.getUserId(), body.getUserRole(), List.of(authority));

        } catch (FeignException.Unauthorized | FeignException.Forbidden e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid or expired token");
        }
    }
}
