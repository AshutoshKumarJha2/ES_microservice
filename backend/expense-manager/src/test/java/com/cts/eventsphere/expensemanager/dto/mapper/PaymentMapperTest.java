package com.cts.eventsphere.expensemanager.dto.mapper;

import com.cts.eventsphere.expensemanager.dto.request.PaymentRequestDto;
import com.cts.eventsphere.expensemanager.dto.response.PaymentResponseDto;
import com.cts.eventsphere.expensemanager.entity.Expense;
import com.cts.eventsphere.expensemanager.entity.Payment;
import com.cts.eventsphere.expensemanager.entity.data.ExpenseStatus;
import com.cts.eventsphere.expensemanager.entity.data.PaymentMethod;
import com.cts.eventsphere.expensemanager.entity.data.PaymentStatus;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

class PaymentMapperTest {

    @Test
    void paymentRequestDtoMapper_toEntity_setsStatusCompleted() {
        Expense expense = Expense.builder()
                .expenseId("exp-1")
                .eventId("event-1")
                .description("Test")
                .amount(BigDecimal.valueOf(1000))
                .date(LocalDate.now())
                .status(ExpenseStatus.APPROVED)
                .build();

        LocalDateTime paymentDate = LocalDateTime.now();
        PaymentRequestDto dto = new PaymentRequestDto(BigDecimal.valueOf(1000), PaymentMethod.BANK_TRANSFER, paymentDate);

        Payment result = PaymentRequestDtoMapper.toEntity(dto, expense);

        assertThat(result.getExpense()).isEqualTo(expense);
        assertThat(result.getInvoiceId()).isNull();
        assertThat(result.getAmount()).isEqualByComparingTo(BigDecimal.valueOf(1000));
        assertThat(result.getMethod()).isEqualTo(PaymentMethod.BANK_TRANSFER);
        assertThat(result.getStatus()).isEqualTo(PaymentStatus.COMPLETED);
        assertThat(result.getPaymentDate()).isEqualTo(paymentDate);
    }

    @Test
    void paymentResponseDtoMapper_toDto_withExpense() {
        Expense expense = Expense.builder()
                .expenseId("exp-2")
                .eventId("event-2")
                .description("Decor")
                .amount(BigDecimal.valueOf(500))
                .date(LocalDate.now())
                .status(ExpenseStatus.PAID)
                .build();

        LocalDateTime now = LocalDateTime.now();
        Payment payment = Payment.builder()
                .paymentId("pay-1")
                .expense(expense)
                .invoiceId(null)
                .amount(BigDecimal.valueOf(500))
                .method(PaymentMethod.CASH)
                .status(PaymentStatus.COMPLETED)
                .paymentDate(now)
                .createdAt(now)
                .updatedAt(now)
                .build();

        PaymentResponseDto result = PaymentResponseDtoMapper.toDto(payment);

        assertThat(result.paymentId()).isEqualTo("pay-1");
        assertThat(result.expenseId()).isEqualTo("exp-2");
        assertThat(result.invoiceId()).isNull();
        assertThat(result.amount()).isEqualByComparingTo(BigDecimal.valueOf(500));
        assertThat(result.method()).isEqualTo(PaymentMethod.CASH);
        assertThat(result.status()).isEqualTo(PaymentStatus.COMPLETED);
        assertThat(result.paymentDate()).isEqualTo(now);
    }

    @Test
    void paymentResponseDtoMapper_toDto_noExpense_expenseIdIsNull() {
        LocalDateTime now = LocalDateTime.now();
        Payment payment = Payment.builder()
                .paymentId("pay-2")
                .expense(null)
                .invoiceId("inv-5")
                .amount(BigDecimal.valueOf(2000))
                .method(PaymentMethod.BANK_TRANSFER)
                .status(PaymentStatus.COMPLETED)
                .paymentDate(now)
                .build();

        PaymentResponseDto result = PaymentResponseDtoMapper.toDto(payment);

        assertThat(result.expenseId()).isNull();
        assertThat(result.invoiceId()).isEqualTo("inv-5");
    }
}
