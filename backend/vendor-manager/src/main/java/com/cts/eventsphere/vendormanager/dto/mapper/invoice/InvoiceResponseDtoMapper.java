package com.cts.eventsphere.vendormanager.dto.mapper.invoice;

import com.cts.eventsphere.vendormanager.dto.invoice.InvoiceResponseDto;
import com.cts.eventsphere.vendormanager.model.Invoice;
import org.springframework.stereotype.Component;

/**
 * Mapper for converting Invoice Entity into InvoiceResponseDto.
 *
 * @author 2480177
 * @version 1.0
 * @since 02-03-2026
 */

@Component
public class InvoiceResponseDtoMapper {

    /**
     * Maps Invoice Entity to InvoiceResponseDto.
     *
     * @param invoice the invoice entity record
     * @return the mapped Invoice response DTO
     */
    public InvoiceResponseDto toDto(Invoice invoice){
        if (invoice == null) {
            return null;
        }
        return new InvoiceResponseDto(
                invoice.getInvoiceId(),
                invoice.getContractId(),
                invoice.getTransactionId(),
                invoice.getIssueDate(),
                invoice.getTotalAmount(),
                invoice.getDueDate(),
                invoice.getStatus(),
                invoice.getCreatedAt(),
                invoice.getUpdatedAt()
        );
    }
}
