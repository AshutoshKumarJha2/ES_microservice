package com.cts.eventsphere.vendormanager.dto.shared;

public record GenericErrorResponse(
        String error
) implements ResponseInterface {
}
