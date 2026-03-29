package com.eventsphere.engagement_manager;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@EnableFeignClients
@SpringBootApplication
public class EngagementManagerApplication {

	public static void main(String[] args) {
		SpringApplication.run(EngagementManagerApplication.class, args);
	}

}
