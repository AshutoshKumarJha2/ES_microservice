package com.cts.eventsphere.eventmanager;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequestMapping("/hello")
@RestController
public class HelloController {

	@GetMapping
	public String sayHello() {
		return "Hello!";
	}
}
