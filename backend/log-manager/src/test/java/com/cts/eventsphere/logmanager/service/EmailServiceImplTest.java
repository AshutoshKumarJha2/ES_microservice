package com.cts.eventsphere.logmanager.service;

import com.cts.eventsphere.logmanager.service.impl.EmailServiceImpl;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmailServiceImplTest {

    @Mock private JavaMailSender mailSender;
    @InjectMocks private EmailServiceImpl emailService;

    // -------------------------------------------------------------------------
    // sendNotificationEmail
    // -------------------------------------------------------------------------
    @Nested
    @DisplayName("sendNotificationEmail(to, subject, body)")
    class SendNotificationEmail {

        @Test
        @DisplayName("happy path – delegates to JavaMailSender with correct message fields")
        void send_happyPath_callsMailSender() {
            emailService.sendNotificationEmail("user@example.com", "Hello", "Message body");

            verify(mailSender).send(argThat((SimpleMailMessage msg) ->
                    "user@example.com".equals(msg.getTo()[0]) &&
                    "Hello".equals(msg.getSubject()) &&
                    "Message body".equals(msg.getText())
            ));
        }

        @Test
        @DisplayName("swallows exception – does not propagate when mail send fails")
        void send_mailSenderThrows_doesNotPropagate() {
            doThrow(new RuntimeException("SMTP connection refused"))
                    .when(mailSender).send(any(SimpleMailMessage.class));

            // must not throw
            emailService.sendNotificationEmail("user@example.com", "Subject", "Body");

            verify(mailSender).send(any(SimpleMailMessage.class));
        }
    }
}
