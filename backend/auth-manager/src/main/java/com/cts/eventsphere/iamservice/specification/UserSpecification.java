package com.cts.eventsphere.iamservice.specification;

import com.cts.eventsphere.iamservice.model.User;
import com.cts.eventsphere.iamservice.model.data.UserRoles;
import com.cts.eventsphere.iamservice.model.data.UserStatus;
import org.springframework.data.jpa.domain.Specification;

public class UserSpecification {

    public static Specification<User> nameOrEmailContains(String search) {
        return (root, query, cb) -> {
            if (search == null || search.isBlank()) return null;
            String pattern = "%" + search.toLowerCase() + "%";
            return cb.or(
                cb.like(cb.lower(root.get("name")), pattern),
                cb.like(cb.lower(root.get("email")), pattern)
            );
        };
    }

    public static Specification<User> hasRole(String role) {
        return (root, query, cb) -> {
            if (role == null || role.isBlank()) return null;
            try {
                return cb.equal(root.get("role"), UserRoles.valueOf(role));
            } catch (IllegalArgumentException e) {
                return null;
            }
        };
    }

    public static Specification<User> hasStatus(String status) {
        return (root, query, cb) -> {
            if (status == null || status.isBlank()) return null;
            try {
                return cb.equal(root.get("status"), UserStatus.valueOf(status));
            } catch (IllegalArgumentException e) {
                return null;
            }
        };
    }

    public static Specification<User> build(String search, String role, String status) {
        return Specification
            .where(nameOrEmailContains(search))
            .and(hasRole(role))
            .and(hasStatus(status));
    }
}
