package com.cts.eventsphere.eventmanager;

import com.cts.eventsphere.eventmanager.auth.service.PublicKeyProvider;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

/**
 * Event Manager Application test class
 *
 * @author 2479623
 *
 * @version 1.0
 * @since 25-03-2026
 */
@SpringBootTest
class EventManagerApplicationTests {

	@MockitoBean
	PublicKeyProvider publicKeyProvider;

	/**
	 * Verifies that the Spring application context loads successfully.
	 *
	 * @return void
	 * @author 2479623
	 * @version 1.0
	 * @since 25-03-2026
	 */
	@Test
	void contextLoads() {
	}

}
