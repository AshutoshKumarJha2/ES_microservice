package com.cts.ticketmanager.controllers;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/ticket-manager")
public class HelloController {
    @GetMapping
    public String hello() {
        return "Hello World";
    }
}
