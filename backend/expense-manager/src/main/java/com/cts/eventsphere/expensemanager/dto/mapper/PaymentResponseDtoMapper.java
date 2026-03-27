package com.cts.eventsphere.expensemanager.dto.mapper;

import com.cts.eventsphere.expensemanager.dto.response.PaymentResponseDto;
import com.cts.eventsphere.expensemanager.entity.Payment;
import org.springframework.stereotype.Component;

/**
 * Maps a {@link Payment} entity to a {@link PaymentResponseDto}.
 *
 * @author 2480081
 * @version 1.0
 * @since 26-03-2026
 */
@Component
public class PaymentResponseDtoMapper {

    private PaymentResponseDtoMapper() {
        // Utility class
    }

    /**
     * Converts a Payment entity into a response DTO.
     *
     * @param payment the persisted payment entity
     * @return the response DTO with all payment details
     */
    public static PaymentResponseDto toDto(Payment payment) {
        return PaymentResponseDto.builder()
                .paymentId(payment.getPaymentId())
                .expenseId(payment.getExpense() != null
                        ? payment.getExpense().getExpenseId()
                        : null)
                .invoiceId(payment.getInvoiceId())
                .amount(payment.getAmount())
                .method(payment.getMethod())
                .status(payment.getStatus())
                .paymentDate(payment.getPaymentDate())
                .createdAt(payment.getCreatedAt())
                .updatedAt(payment.getUpdatedAt())
                .build();
    }
}