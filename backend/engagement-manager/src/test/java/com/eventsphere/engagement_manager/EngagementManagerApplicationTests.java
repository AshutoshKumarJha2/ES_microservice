package com.eventsphere.engagement_manager;

import com.eventsphere.engagement_manager.auth.service.PublicKeyProvider;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

@SpringBootTest
class EngagementManagerApplicationTests {

	@MockitoBean
	PublicKeyProvider publicKeyProvider;

	@Test
	void contextLoads() {
	}

}
