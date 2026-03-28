package com.cts.eventsphere.vendormanager.dto.contract;

import com.cts.eventsphere.vendormanager.model.data.ContractStatus;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ContractRequestDto(
        @NotBlank(message = "Vendor ID is required to link the contract")
        String vendorId,

        @NotBlank(message = "Event ID is required to link the contract")
        String eventId,

        @NotNull(message = "Start date is required")
        @FutureOrPresent(message = "Contract cannot start in the past")
        LocalDateTime startDate,

        @NotNull(message = "End date is required")
        @Future(message = "Contract end date must be in the future")
        LocalDateTime endDate,

        @NotNull(message = "Contract value is required")
        @Positive(message = "Contract value must be a positive amount")
        BigDecimal value,

        @NotNull(message = "Contract status is required")
        ContractStatus status
) {
}
