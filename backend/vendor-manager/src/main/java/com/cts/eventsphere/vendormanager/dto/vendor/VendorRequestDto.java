package com.cts.eventsphere.vendormanager.dto.vendor;

import com.cts.eventsphere.vendormanager.model.data.VendorStatus;
import jakarta.validation.constraints.*;

public record VendorRequestDto(
        @NotBlank(message = "Vendor name cannot be empty")
        @Size(max = 100, message = "Vendor name must not exceed 100 characters")
        String name,

        @NotBlank(message = "Contact information is required for communication")
        String contactInfo,

        @NotNull(message = "Vendor status (ACTIVE/INACTIVE) must be specified")
        VendorStatus status
) {
}
