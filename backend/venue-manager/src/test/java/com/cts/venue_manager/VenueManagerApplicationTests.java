package com.cts.venue_manager;

import com.cts.venue_manager.auth.service.PublicKeyProvider;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

@SpringBootTest
class VenueManagerApplicationTests {

	@MockitoBean
	PublicKeyProvider publicKeyProvider;

	@Test
	void contextLoads() {
	}

}
