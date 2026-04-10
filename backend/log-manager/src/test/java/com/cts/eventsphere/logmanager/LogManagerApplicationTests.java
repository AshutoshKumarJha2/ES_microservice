package com.cts.eventsphere.logmanager;

import com.cts.eventsphere.logmanager.auth.service.PublicKeyProvider;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

@SpringBootTest
class LogManagerApplicationTests {

	@MockitoBean
	PublicKeyProvider publicKeyProvider;

	@MockitoBean
	JavaMailSender javaMailSender;

	@Test
	void contextLoads() {
	}

}
