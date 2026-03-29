package com.cts.eventsphere.vendormanager;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;

@EnableFeignClients
@EnableDiscoveryClient
@SpringBootApplication
public class VendorManagerApplication {

	public static void main(String[] args) {
		SpringApplication.run(VendorManagerApplication.class, args);
	}

}
