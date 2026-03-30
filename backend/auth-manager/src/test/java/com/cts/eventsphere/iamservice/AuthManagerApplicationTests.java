package com.cts.eventsphere.iamservice;

import org.junit.jupiter.api.Test;
import org.mockito.MockedStatic;
import org.mockito.Mockito;
import org.springframework.boot.SpringApplication;
import org.springframework.context.ConfigurableApplicationContext;

/**
 * Tests for {@link AuthManagerApplication}.
 *
 * <p>The {@code main} method is verified using a static mock of {@link SpringApplication}
 * so that no real Spring context (and thus no external infrastructure) is needed.</p>
 *
 * @author 2480010
 * @version 1.0
 * @since 25-03-2026
 */
class AuthManagerApplicationTests {

    @Test
    void main_ShouldDelegateToSpringApplicationRun() {
        String[] args = new String[]{};
        try (MockedStatic<SpringApplication> springApp = Mockito.mockStatic(SpringApplication.class)) {
            springApp.when(() -> SpringApplication.run(AuthManagerApplication.class, args))
                    .thenReturn(Mockito.mock(ConfigurableApplicationContext.class));

            AuthManagerApplication.main(args);

            springApp.verify(() -> SpringApplication.run(AuthManagerApplication.class, args));
        }
    }
}
