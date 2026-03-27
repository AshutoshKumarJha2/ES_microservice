package com.cts.eventsphere.iamservice.repository;

import com.cts.eventsphere.iamservice.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Spring Data JPA repository for {@link User} entities.
 *
 * <p>Extends {@link JpaRepository} to provide standard CRUD operations with the user's UUID
 * string as the primary key. Additional query methods are declared below to support
 * email-based lookups required during authentication and registration.</p>
 *
 * @author 2480010
 * @version 1.0
 * @since 25-03-2026
 */
@Repository
public interface UserRepository extends JpaRepository<User,String> {

    /**
     * Finds a user by their email address.
     *
     * @param email the email address to search for
     * @return an {@link Optional} containing the matching {@link User}, or empty if not found
     */
    Optional<User> findByEmail(String email);

    /**
     * Checks whether a user with the given email address already exists.
     *
     * @param email the email address to check
     * @return {@code true} if a user with this email exists; {@code false} otherwise
     */
    boolean existsByEmail(String email);
}
