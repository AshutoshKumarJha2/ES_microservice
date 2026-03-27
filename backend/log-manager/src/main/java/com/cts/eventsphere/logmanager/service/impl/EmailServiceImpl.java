package com.cts.eventsphere.logmanager.service.impl;

import com.cts.eventsphere.logmanager.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

/**
 * Implementation of Email Service to handle Email updates for notifications.
 * * @author 2479623
 *
 * @version 1.0
 * @since 26-03-2026
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {
    private final JavaMailSender mailSender;

    /**
     * @param to
     * @param subject
     * @param body
     */
    @Override
    @Async("taskExecutor")
    public void sendNotificationEmail(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);

            mailSender.send(message);
            log.info("Email sent successfully to {}", to);
        } catch (Exception e) {
            log.error("Async email delivery failed for {}: {}", to, e.getMessage());
        }
    }
}
