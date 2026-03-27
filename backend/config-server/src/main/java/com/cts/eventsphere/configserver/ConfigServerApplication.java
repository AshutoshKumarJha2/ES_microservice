package com.cts.eventsphere.configserver;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.config.server.EnableConfigServer;

/**
 * Config Server Application class
 *
 * @author 2479623
 *
 * @version 1.0
 * @since 25-03-2026
 */
@SpringBootApplication
@EnableConfigServer
public class ConfigServerApplication {

	/**
	 * Entry point for the Config Server microservice.
	 * Starts the centralized configuration server for all microservices.
	 *
	 * @param args command-line arguments passed at startup
	 * @return void
	 * @author 2479623
	 * @version 1.0
	 * @since 25-03-2026
	 */
	public static void main(String[] args) {
		SpringApplication.run(ConfigServerApplication.class, args);
	}

}
