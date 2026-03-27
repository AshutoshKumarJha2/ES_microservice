package com.cts.eventsphere.iamservice.config;

import com.cts.eventsphere.iamservice.security.JwtFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * Spring Security configuration for the Auth Manager microservice.
 *
 * <p>Configures a stateless, JWT-based security model:
 * <ul>
 *   <li>CSRF, HTTP Basic, and form-login are disabled.</li>
 *   <li>All {@code /api/v1/auth/**} endpoints are publicly accessible.</li>
 *   <li>Every other endpoint requires an authenticated request (valid access token).</li>
 *   <li>{@link JwtFilter} is inserted before the default
 *       {@link UsernamePasswordAuthenticationFilter}.</li>
 *   <li>Method-level security is enabled via {@code @EnableMethodSecurity}
 *       (supports {@code @PreAuthorize}, {@code @Secured}, and JSR-250 annotations).</li>
 * </ul>
 * </p>
 *
 * @author 2480010
 * @version 1.0
 * @since 25-03-2026
 */
@Configuration
@RequiredArgsConstructor
@EnableMethodSecurity(
        securedEnabled = true,
        jsr250Enabled = true
)
public class SecurityConfig {
    private final JwtFilter jwtFilter;

    /**
     * Provides a BCrypt password encoder bean used for hashing and verifying user passwords.
     *
     * @return a {@link BCryptPasswordEncoder} instance
     */
    @Bean
    public PasswordEncoder passwordEncoder(){
        return new BCryptPasswordEncoder();
    }

    /**
     * Configures and builds the {@link SecurityFilterChain} for the application.
     *
     * <p>Disables stateful session management and registers the {@link JwtFilter}
     * before the standard username/password filter. Public paths ({@code /api/v1/auth/**})
     * are allowed without authentication; all other paths require a valid JWT.</p>
     *
     * @param http the {@link HttpSecurity} builder provided by Spring Security
     * @return the fully configured {@link SecurityFilterChain}
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) {
        return http.csrf(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/v1/auth/**").permitAll()
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }
}
