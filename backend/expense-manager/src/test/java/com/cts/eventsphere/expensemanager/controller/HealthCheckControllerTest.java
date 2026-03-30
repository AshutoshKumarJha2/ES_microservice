package com.cts.eventsphere.expensemanager.controller;

import com.cts.eventsphere.expensemanager.HealthCheckController;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class HealthCheckControllerTest {

    private final HealthCheckController controller = new HealthCheckController();

    @Test
    void ping_returnsRunningMessage() {
        String result = controller.ping();

        assertThat(result).isEqualTo("Expense Manager is running!");
    }
}
