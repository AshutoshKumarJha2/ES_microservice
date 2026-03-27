package com.cts.eventsphere.expensemanager;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthCheckController {
    @GetMapping("/ping")
    public String ping() {
        return "Expense Manager is running!";
    }
}
