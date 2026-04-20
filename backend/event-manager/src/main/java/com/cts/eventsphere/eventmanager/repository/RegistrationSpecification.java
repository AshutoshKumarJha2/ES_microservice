package com.cts.eventsphere.eventmanager.repository;

import com.cts.eventsphere.eventmanager.model.Registration;
import com.cts.eventsphere.eventmanager.model.data.RegistrationStatus;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

/**
 * Fluent builder for constructing {@link Specification} predicates against the
 * {@link Registration} entity.
 *
 * <p>Usage example:
 * <pre>{@code
 * Specification<Registration> spec = RegistrationSpecification.builder()
 *         .eventId(eventId)
 *         .status(status)
 *         .ticketType(ticketType)
 *         .build();
 * }</pre>
 *
 * @author test-in-prod-10x
 * @version 1.0
 * @since 2026-04-18
 */
public class RegistrationSpecification {

    private RegistrationSpecification() {}

    public static Builder builder() {
        return new Builder();
    }

    public static final class Builder {

        private String eventId;
        private RegistrationStatus status;
        private List<RegistrationStatus> statuses;
        private String ticketType;

        private Builder() {}

        /** Filter by event. Required — at least one registration must belong to this event. */
        public Builder eventId(String eventId) {
            this.eventId = eventId;
            return this;
        }

        /**
         * Filter by a single registration status. Ignored when {@code null} or blank.
         * Mutually exclusive with {@link #statuses} — whichever is set last wins.
         *
         * @param status raw string value of {@link RegistrationStatus} (e.g. "PENDING")
         * @throws IllegalArgumentException if the value does not match any {@link RegistrationStatus}
         */
        public Builder status(String status) {
            if (status != null && !status.isBlank()) {
                this.status = RegistrationStatus.valueOf(status);
                this.statuses = null;
            }
            return this;
        }

        /**
         * Filter by multiple registration statuses using an SQL {@code IN} predicate.
         * Ignored when {@code null} or empty.
         * Mutually exclusive with {@link #status} — whichever is set last wins.
         */
        public Builder statuses(List<RegistrationStatus> statuses) {
            if (statuses != null && !statuses.isEmpty()) {
                this.statuses = statuses;
                this.status = null;
            }
            return this;
        }

        /** Filter by ticket type (case-insensitive). Ignored when {@code null} or blank. */
        public Builder ticketType(String ticketType) {
            this.ticketType = (ticketType != null && !ticketType.isBlank()) ? ticketType : null;
            return this;
        }

        public Specification<Registration> build() {
            return (root, query, cb) -> {
                List<Predicate> predicates = new ArrayList<>();

                if (eventId != null) {
                    predicates.add(cb.equal(root.get("event").get("eventId"), eventId));
                }
                if (statuses != null) {
                    predicates.add(root.get("status").in(statuses));
                } else if (status != null) {
                    predicates.add(cb.equal(root.get("status"), status));
                }
                if (ticketType != null) {
                    predicates.add(cb.equal(cb.lower(root.get("ticket").get("type")), ticketType.toLowerCase()));
                }

                return cb.and(predicates.toArray(new Predicate[0]));
            };
        }
    }
}
