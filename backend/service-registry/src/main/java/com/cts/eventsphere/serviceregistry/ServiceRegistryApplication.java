package com.cts.eventsphere.serviceregistry;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.server.EnableEurekaServer;

/**
 * Service Registry Application class
 *
 * @author 2479623
 *
 * @version 1.0
 * @since 25-03-2026
 */
@SpringBootApplication
@EnableEurekaServer
public class ServiceRegistryApplication {

	/**
	 * Entry point for the Service Registry microservice.
	 * Starts the Eureka Server for service discovery.
	 *
	 * @param args command-line arguments passed at startup
	 * @return void
	 * @author 2479623
	 * @version 1.0
	 * @since 25-03-2026
	 */
	public static void main(String[] args) {
		SpringApplication.run(ServiceRegistryApplication.class, args);
	}

}
