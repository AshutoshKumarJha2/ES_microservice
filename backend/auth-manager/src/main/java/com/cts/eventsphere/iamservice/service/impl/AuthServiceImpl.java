package com.cts.eventsphere.iamservice.service.impl;

import com.cts.eventsphere.iamservice.dto.auth.LoginRequestDto;
import com.cts.eventsphere.iamservice.dto.auth.LoginResponseDto;
import com.cts.eventsphere.iamservice.dto.auth.RegisterResponseDto;
import com.cts.eventsphere.iamservice.dto.auth.ValidateResponse;
import com.cts.eventsphere.iamservice.dto.user.UserRequestDto;
import com.cts.eventsphere.iamservice.exception.user.*;
import com.cts.eventsphere.iamservice.model.User;
import com.cts.eventsphere.iamservice.model.data.UserStatus;
import com.cts.eventsphere.iamservice.repository.UserRepository;
import com.cts.eventsphere.iamservice.security.JwtUtil;
import com.cts.eventsphere.iamservice.security.TokenType;
import com.cts.eventsphere.iamservice.security.UserPrincipal;
import com.cts.eventsphere.iamservice.service.AuthService;
import io.jsonwebtoken.JwtException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;


/**
 * Default implementation of {@link AuthService} providing the complete authentication lifecycle.
 *
 * <p>Handles user registration (with BCrypt password hashing), credential-based login,
 * JWT access/refresh token issuance, token renewal via refresh tokens, and stateless
 * token validation for the API Gateway.</p>
 *
 * <p>Dependencies injected: {@link UserRepository} for persistence, {@link PasswordEncoder}
 * for BCrypt operations, and {@link JwtUtil} for token generation and parsing.</p>
 *
 * @author 2480010
 * @version 1.0
 * @since 25-03-2026
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;


    /**
     * {@inheritDoc}
     *
     * <p>Checks for an existing account with the same email before persisting.
     * The password is BCrypt-encoded before storage.</p>
     */
    @Override
    public RegisterResponseDto register(UserRequestDto dto) {
        var existingUser = userRepository.findByEmail(dto.email());

        if (existingUser.isPresent()) {
//            auditService.logAudit(existingUser.getUserId(), AuditAction.REGISTRATION_FAILURE, User.class, user.getUserId());
            throw new UserAlreadyExistsException(dto.email());
        }

        User user = new User();
        user.setName(dto.name());
        user.setEmail(dto.email());
        user.setPhone(dto.phone());
        user.setPassword(passwordEncoder.encode(dto.password())); // Hashing
        userRepository.save(user);
        log.info("User {} registered with id {}", user.getName(),user.getUserId());
//        auditService.logAudit(user.getUserId(), AuditAction.REGISTRATION_SUCCESS, User.class, user.getUserId());
        String successRegistration = "User registered successfully with email: " + user.getEmail();
        return new RegisterResponseDto(user.getUserId(), user.getName(), user.getEmail(), user.getRole().name(), user.getPhone(), user.getStatus().name(), successRegistration);
    }

    /**
     * {@inheritDoc}
     *
     * <p>Looks up the user by email, verifies the password with BCrypt, then generates
     * both an access token and a refresh token.</p>
     */
    @Override
    public LoginResponseDto login(LoginRequestDto loginDto) {
        User user = userRepository.findByEmail(loginDto.email())
                .orElseThrow(() ->{
                    log.warn("Login failed for email: {} - user not found", loginDto.email());
                    return new UserNotFoundException(loginDto.email());
                });

        if (!passwordEncoder.matches(loginDto.password(), user.getPassword())) {
            log.warn("Login failed: invalid password");
            throw new InvalidPasswordException("Invalid password provided");
        }

        String roleName = user.getRole().name();

        String accessToken = jwtUtil.generateAccessToken(user.getUserId(), roleName);
        String refreshToken = jwtUtil.generateRefreshToken(user.getUserId(), roleName);

//        auditService.logAudit(user.getUserId(), AuditAction.LOGIN_SUCCESS, User.class, user.getUserId());
        return new LoginResponseDto(accessToken, refreshToken, "Bearer");
    }

    /**
     * {@inheritDoc}
     *
     * <p>Re-validates the user's current role and account status against the database
     * before issuing new tokens, ensuring stale refresh tokens cannot be used after
     * an admin has changed the user's role or deactivated the account.</p>
     */
    @Override
    public LoginResponseDto refreshToken(UserPrincipal principal) {
        String userId = principal.userId();
//        String email = principal.email();
        String roleName = principal.role();
        var user = userRepository.findById(userId).orElseThrow(() -> new UserNotFoundException(userId));

        if(!user.getRole().name().equals(roleName)){
            throw new RefreshFailedException(userId);
        }

        roleName = user.getRole().name();

        if(user.getStatus().equals(UserStatus.INACTIVE)){
            throw new UserNotActiveException(userId);
        }

        if(user.getStatus().equals(UserStatus.SUSPENDED)){
            throw  new UserSuspendedException(userId);
        }

        String newAccessToken = jwtUtil.generateAccessToken(userId, roleName);
        String newRefreshToken = jwtUtil.generateRefreshToken(userId, roleName);

        return new LoginResponseDto(newAccessToken, newRefreshToken, "Bearer");
    }

    /**
     * {@inheritDoc}
     *
     * <p>Strips the {@code "Bearer "} prefix, validates the token signature and type
     * (must be {@link TokenType#ACCESS}), and extracts the user ID and role from the claims.</p>
     */
    @Override
    public ValidateResponse validateToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing or invalid Authorization header");
        }

        String token = authHeader.substring(7);

        try {
            if (!jwtUtil.validateToken(token, TokenType.ACCESS)) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid or expired token");
            }

            String userId = jwtUtil.extractUserId(token);
            String role = jwtUtil.extractRole(token);

            return new ValidateResponse(userId, role);

        } catch (JwtException e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid token");
        }
    }
}
