package com.cts.eventsphere.apigateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * API Gateway Application class
 *
 * @author 2479623
 *
 * @version 1.0
 * @since 25-03-2026
 */
@SpringBootApplication
public class ApiGatewayApplication {

	/**
	 * Entry point for the API Gateway microservice.
	 * Bootstraps the Spring Boot application and starts the gateway for routing requests.
	 *
	 * @param args command-line arguments passed at startup
	 * @return void
	 * @author 2479623
	 * @version 1.0
	 * @since 25-03-2026
	 */
	public static void main(String[] args) {
		SpringApplication.run(ApiGatewayApplication.class, args);
	}

}
