package com.cts.eventsphere.vendormanager.dto.vendor;

import com.cts.eventsphere.vendormanager.model.data.VendorStatus;
import jakarta.validation.constraints.*;

import java.time.LocalDateTime;

public record VendorResponseDto(
        @NotBlank(message = "Internal Error: Vendor ID is missing in response")
        String vendorId,

        @NotBlank(message = "Vendor name must be present in response")
        String name,

        @NotBlank(message = "Contact info must be present in response")
        String contactInfo,

        @NotNull(message = "Status must be present in response")
        VendorStatus status,

        @NotNull(message = "Creation timestamp is missing")
        LocalDateTime createdAt,

        @NotNull(message = "Last update timestamp is missing")
        LocalDateTime updatedAt
) {
}
