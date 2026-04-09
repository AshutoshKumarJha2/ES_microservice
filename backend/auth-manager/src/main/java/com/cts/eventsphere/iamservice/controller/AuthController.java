package com.cts.eventsphere.iamservice.controller;

import com.cts.eventsphere.iamservice.dto.auth.LoginRequestDto;
import com.cts.eventsphere.iamservice.dto.auth.LoginResponseDto;
import com.cts.eventsphere.iamservice.dto.auth.RegisterResponseDto;
import com.cts.eventsphere.iamservice.dto.auth.ValidateResponse;
import com.cts.eventsphere.iamservice.dto.servicetoken.ServiceTokenRequest;
import com.cts.eventsphere.iamservice.dto.servicetoken.ServiceTokenResponse;
import com.cts.eventsphere.iamservice.dto.user.UserRequestDto;
import com.cts.eventsphere.iamservice.dto.user.UserResponseDto;
import com.cts.eventsphere.iamservice.security.RsaKeyProvider;
import com.cts.eventsphere.iamservice.security.UserPrincipal;
import com.cts.eventsphere.iamservice.service.AuthService;
import com.cts.eventsphere.iamservice.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import java.util.List;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller exposing the authentication endpoints of the Auth Manager service.
 *
 * <p>Base path: {@code /api/v1/auth}. All endpoints are publicly accessible (no JWT required)
 * except {@code /refresh}, which requires a valid refresh token in the {@code Authorization} header.</p>
 *
 * <p>Delegates all business logic to {@link AuthService}.</p>
 *
 * @author 2480010
 * @version 1.0
 * @since 25-03-2026
 */
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserService userService;
    private final RsaKeyProvider rsaKeyProvider;

    /**
     * Registers a new user account.
     *
     * <p>{@code POST /api/v1/auth/register}</p>
     *
     * @param dto the registration payload containing name, email, password, and phone
     * @return HTTP 200 OK with a {@link RegisterResponseDto} containing the new user's profile
     *         and a confirmation message
     */
    @PostMapping("/register")
    public ResponseEntity<RegisterResponseDto> register(@RequestBody UserRequestDto dto) {
        return ResponseEntity.ok(authService.register(dto));
    }

    /**
     * Authenticates a user with their email and password.
     *
     * <p>{@code POST /api/v1/auth/login}</p>
     *
     * @param dto the login credentials (email and password)
     * @return HTTP 200 OK with a {@link LoginResponseDto} containing access token, refresh token,
     *         and token type
     */
    @PostMapping("/login")
    public ResponseEntity<LoginResponseDto> login(@RequestBody LoginRequestDto dto) {
        var response = authService.login(dto);
        return ResponseEntity.ok(response);
    }

    /**
     * Issues a new pair of access and refresh tokens using a valid refresh token.
     *
     * <p>{@code POST /api/v1/auth/refresh} — requires a valid refresh token in the
     * {@code Authorization: Bearer <refreshToken>} header.</p>
     *
     * @param principal the {@link UserPrincipal} extracted from the refresh token by {@link JwtFilter}
     * @return HTTP 200 OK with a new {@link LoginResponseDto}
     */
    @PostMapping("/refresh")
    public ResponseEntity<LoginResponseDto> refreshToken(@AuthenticationPrincipal UserPrincipal principal) {
        var response = authService.refreshToken(principal);
        return ResponseEntity.ok(response);
    }

    /**
     * Validates an access token and returns the user ID and role it carries.
     *
     * <p>{@code GET /api/v1/auth/validate} — called by the API Gateway or downstream
     * microservices to verify an incoming Bearer token before forwarding the request.</p>
     *
     * @param authHeader the full {@code Authorization} header value (e.g. {@code "Bearer <token>"})
     * @return HTTP 200 OK with a {@link ValidateResponse} containing the user ID and role
     */
    @GetMapping("/validate")
    public ResponseEntity<ValidateResponse> validate(@RequestHeader("Authorization") String authHeader) {
        return ResponseEntity.ok(authService.validateToken(authHeader));
    }

    /**
     * Issues a short-lived RSA-signed service token to a verified internal service.
     *
     * <p>{@code POST /api/v1/auth/service-token} — no user authentication required.
     * The service authenticates via its pre-shared secret; the role is assigned server-side.</p>
     *
     * @param request contains {@code serviceName} and {@code serviceSecret}
     * @return HTTP 200 with a {@link ServiceTokenResponse}, or 401 if credentials are invalid
     */
    @PostMapping("/service-token")
    public ResponseEntity<ServiceTokenResponse> issueServiceToken(@RequestBody ServiceTokenRequest request) {
        return ResponseEntity.ok(authService.issueServiceToken(request));
    }

    /**
     * Returns the RSA public key used to sign service tokens, in PEM format.
     *
     * <p>{@code GET /api/v1/auth/service-token/public-key} — public endpoint.
     * Downstream services fetch this at startup to enable local token validation.</p>
     *
     * @return the PEM-encoded X.509 public key string
     */
    @GetMapping("/service-token/public-key")
    public ResponseEntity<String> getServiceTokenPublicKey() {
        return ResponseEntity.ok(rsaKeyProvider.getPublicKeyPem());
    }

}
