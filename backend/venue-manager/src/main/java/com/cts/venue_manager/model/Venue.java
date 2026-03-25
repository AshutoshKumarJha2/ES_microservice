package com.cts.venue_manager.model;

import com.cts.venue_manager.model.data.AvailabilityStatus;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "venue")
@Data
public class Venue {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "venueId")
    private String venueId;

    @OneToMany(mappedBy = "venue", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Resource> resources;

    @OneToMany(mappedBy = "venue", cascade = CascadeType.ALL)
    private List<Booking> bookings;

    @Column(nullable = false, columnDefinition = "VARCHAR(255)")
    private String location;

    @Column(nullable = false)
    private int capacity;

    @Column(nullable = false, columnDefinition = "VARCHAR(100)")
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "ENUM('available','unavailable','maintenance')")
    private AvailabilityStatus availabilityStatus = AvailabilityStatus.available;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
