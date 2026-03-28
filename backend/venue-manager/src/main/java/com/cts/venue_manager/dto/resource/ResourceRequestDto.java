package com.cts.venue_manager.dto.resource;

import com.cts.venue_manager.model.data.ResourceType;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;

public record ResourceRequestDto(
        @NotBlank(message = "Resource name is required")
        @Size(max = 100, message = "Resource name cannot exceed 100 characters")
        String name,

        @NotNull(message = "Resource type must be specified")
        ResourceType type,

        @NotNull(message = "Cost rate is required")
        @DecimalMin(value = "0.0", inclusive = true, message = "Cost rate cannot be negative")
        @Digits(integer = 10, fraction = 2, message = "Cost rate must be a valid monetary amount")
        BigDecimal costRate,

        @NotNull(message = "Unit/Quantity is required")
        @Min(value = 1, message = "Unit must be at least 1")
        Integer unit
) {
}