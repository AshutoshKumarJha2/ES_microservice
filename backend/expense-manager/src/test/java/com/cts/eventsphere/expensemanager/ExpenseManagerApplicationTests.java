package com.cts.eventsphere.expensemanager;

import com.cts.eventsphere.expensemanager.auth.service.PublicKeyProvider;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

@SpringBootTest
class ExpenseManagerApplicationTests {

	@MockitoBean
	PublicKeyProvider publicKeyProvider;

	@Test
	void contextLoads() {
	}

}
