package com.cts.venue_manager;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class VenueManagerApplication {
	public static void main(String[] args) {
		SpringApplication.run(VenueManagerApplication.class, args);
	}

}
