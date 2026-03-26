package com.cts.ticketmanager.dto.registration;

import java.util.List;

/**
 * DTO object for returning list of response object in pagation
 *
 * @author test-in-prod-10x
 * @version 1.0
 * @since 2026-03-05
 */
public record RegistrationListResponseDTO(
        List<RegistrationDTO> registrations,
        int page,
        int size,
        long totalElements,
        int totalPages
) {

}
