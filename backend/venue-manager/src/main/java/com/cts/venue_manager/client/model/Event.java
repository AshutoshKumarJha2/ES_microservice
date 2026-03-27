package com.cts.venue_manager.client.model;

import com.cts.venue_manager.client.model.data.EventStatus;
import jakarta.persistence.*;
import lombok.Builder;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.DynamicInsert;
import org.hibernate.annotations.DynamicUpdate;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
public class Event {
    private String eventId;
    private String name;
    private String organizerId;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String venueId;
    private EventStatus status;
}
