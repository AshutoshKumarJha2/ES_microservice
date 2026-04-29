package com.cts.eventsphere.eventmanager.repository;

import com.cts.eventsphere.eventmanager.model.Event;
import com.cts.eventsphere.eventmanager.model.data.EventStatus;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

/**
 * Fluent builder for constructing {@link Specification} predicates against the {@link Event} entity.
 *
 * <p>Usage example:
 * <pre>{@code
 * Specification<Event> spec = EventSpecification.builder()
 *         .nameContains(search)
 *         .statusEquals(status)
 *         .excludeStatus(EventStatus.DRAFT)
 *         .build();
 * }</pre>
 *
 * @author test-in-prod-10x
 * @version 1.0
 * @since 2026-04-27
 */
public class EventSpecification {

    private EventSpecification() {}

    public static Builder builder() {
        return new Builder();
    }

    public static final class Builder {

        private String nameContains;
        private EventStatus statusEquals;
        private EventStatus excludeStatus;

        private Builder() {}

        /** Case-insensitive substring match on event name. Ignored when {@code null} or blank. */
        public Builder nameContains(String search) {
            this.nameContains = (search != null && !search.isBlank()) ? search.trim() : null;
            return this;
        }

        /**
         * Exact status match. Ignored when {@code null}, blank, or {@code "ALL"}.
         *
         * @param status raw string value of {@link EventStatus}
         * @throws IllegalArgumentException if the value does not match any {@link EventStatus}
         */
        public Builder statusEquals(String status) {
            if (status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status)) {
                this.statusEquals = EventStatus.valueOf(status.toUpperCase());
            }
            return this;
        }

        /** Exclude events with this status (e.g. DRAFT for ATTENDEE role). Ignored when {@code null}. */
        public Builder excludeStatus(EventStatus status) {
            this.excludeStatus = status;
            return this;
        }

        public Specification<Event> build() {
            return (root, query, cb) -> {
                List<Predicate> predicates = new ArrayList<>();

                if (nameContains != null) {
                    predicates.add(cb.like(cb.lower(root.get("name")), "%" + nameContains.toLowerCase() + "%"));
                }
                if (statusEquals != null) {
                    predicates.add(cb.equal(root.get("status"), statusEquals));
                }
                if (excludeStatus != null) {
                    predicates.add(cb.notEqual(root.get("status"), excludeStatus));
                }

                return cb.and(predicates.toArray(new Predicate[0]));
            };
        }
    }
}
