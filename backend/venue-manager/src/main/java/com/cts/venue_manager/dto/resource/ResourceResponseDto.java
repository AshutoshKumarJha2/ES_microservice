package com.cts.venue_manager.dto.resource;

import com.cts.venue_manager.model.data.Availability;
import com.cts.venue_manager.model.data.ResourceType;

import java.math.BigDecimal;

public record ResourceResponseDto(String resourceId,
                                  String venueId,
                                  ResourceType type,
                                  String name,
                                  Availability availability,
                                  Integer unit,
                                  BigDecimal costRate
                                  ) {
}
