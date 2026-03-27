package com.cts.eventsphere.eventmanager;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Event Manager Application class
 *
 * @author 2479623
 *
 * @version 1.0
 * @since 25-03-2026
 */
@SpringBootApplication
public class EventManagerApplication {

	/**
	 * Entry point for the Event Manager microservice.
	 * Bootstraps the Spring Boot application context.
	 *
	 * @param args command-line arguments passed at startup
	 * @return void
	 * @author 2479623
	 * @version 1.0
	 * @since 25-03-2026
	 */
	public static void main(String[] args) {
		SpringApplication.run(EventManagerApplication.class, args);
	}

}
