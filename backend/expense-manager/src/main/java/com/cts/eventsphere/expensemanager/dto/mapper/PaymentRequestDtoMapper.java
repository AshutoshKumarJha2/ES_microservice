package com.cts.eventsphere.expensemanager.dto.mapper;

import com.cts.eventsphere.expensemanager.dto.request.PaymentRequestDto;
import com.cts.eventsphere.expensemanager.entity.Expense;
import com.cts.eventsphere.expensemanager.entity.Payment;
import com.cts.eventsphere.expensemanager.entity.data.PaymentStatus;
import org.springframework.stereotype.Component;

/**
 * Maps a {@link PaymentRequestDto} to a {@link Payment} entity.
 *
 * @author 2480081
 * @version 1.0
 * @since 26-03-2026
 */
@Component
public class PaymentRequestDtoMapper {

    private PaymentRequestDtoMapper() {
        // Utility class
    }

    /**
     * Converts a request DTO into a Payment entity linked to an expense.
     *
     * @param dto     the payment request details
     * @param expense the approved expense being paid
     * @return a new Payment entity ready to be persisted
     */
    public static Payment toEntity(PaymentRequestDto dto, Expense expense) {
        return Payment.builder()
                .expense(expense)
                .invoiceId(null)
                .amount(dto.amount())
                .method(dto.method())
                .status(PaymentStatus.COMPLETED)
                .paymentDate(dto.paymentDate())
                .build();
    }
}