package com.cts.eventsphere.logmanager.auth.dto;

import lombok.Data;

@Data
public class ValidateResponse {
    private String userId;
    private String userRole;
}
