package com.cts.eventsphere.vendormanager;

import com.cts.eventsphere.vendormanager.auth.service.PublicKeyProvider;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

@SpringBootTest
class VendorManagerApplicationTests {

	@MockitoBean
	PublicKeyProvider publicKeyProvider;

	@Test
	void contextLoads() {
	}

}
