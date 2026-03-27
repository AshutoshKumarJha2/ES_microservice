package com.cts.eventsphere.iamservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Entry point for the Auth Manager microservice.
 *
 * <p>This Spring Boot application bootstraps the IAM (Identity and Access Management) service
 * responsible for user registration, authentication, authorization, and JWT token management
 * within the EventSphere platform.</p>
 *
 * @author 2480010
 * @version 1.0
 * @since 25-03-2026
 */
@SpringBootApplication
public class AuthManagerApplication {

	/**
	 * Main method that launches the Spring Boot application.
	 *
	 * @param args command-line arguments passed at startup
	 */
	public static void main(String[] args) {
		SpringApplication.run(AuthManagerApplication.class, args);
	}

}
