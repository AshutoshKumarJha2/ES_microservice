package com.cts.eventsphere.logmanager.repository;

import com.cts.eventsphere.logmanager.model.AuditLog;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

/**
 * JPA Specification builder for {@link AuditLog} search queries.
 *
 * @author test-in-prod-10x
 * @version 1.0
 * @since 2026-04-26
 */
public class AuditLogSpecification {

    private AuditLogSpecification() {}

    public static Builder builder() {
        return new Builder();
    }

    public static final class Builder {

        private String search;
        private String action;

        private Builder() {}

        /**
         * Case-insensitive LIKE filter across userId, action, entityName, entityId.
         * Ignored when null or blank.
         */
        public Builder search(String search) {
            this.search = (search != null && !search.isBlank()) ? search.toLowerCase() : null;
            return this;
        }

        /**
         * Exact match on action field. Ignored when null or blank.
         */
        public Builder action(String action) {
            this.action = (action != null && !action.isBlank()) ? action : null;
            return this;
        }

        public Specification<AuditLog> build() {
            return (root, query, cb) -> {
                List<Predicate> predicates = new ArrayList<>();

                if (search != null) {
                    String like = "%" + search + "%";
                    List<Predicate> searchPreds = new ArrayList<>();
                    searchPreds.add(cb.like(cb.lower(root.get("userId")),     like));
                    searchPreds.add(cb.like(cb.lower(root.get("action")),     like));
                    searchPreds.add(cb.like(cb.lower(root.get("entityName")), like));
                    searchPreds.add(cb.like(cb.lower(root.get("entityId")),   like));
                    predicates.add(cb.or(searchPreds.toArray(new Predicate[0])));
                }

                if (action != null) {
                    predicates.add(cb.equal(root.get("action"), action));
                }

                return predicates.isEmpty()
                        ? cb.conjunction()
                        : cb.and(predicates.toArray(new Predicate[0]));
            };
        }
    }
}
