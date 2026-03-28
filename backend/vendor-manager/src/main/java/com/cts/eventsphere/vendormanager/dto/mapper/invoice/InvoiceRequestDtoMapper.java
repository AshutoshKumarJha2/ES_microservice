package com.cts.eventsphere.vendormanager.dto.mapper.invoice;

import com.cts.eventsphere.vendormanager.dto.invoice.InvoiceRequestDto;
import com.cts.eventsphere.vendormanager.model.Invoice;
import org.springframework.stereotype.Component;

/**
 * Mapper for converting InvoiceRequestDto into Invoice Entity.
 *
 * @author 2480177
 * @version 1.0
 * @since 02-03-2026
 */

@Component
public class InvoiceRequestDtoMapper {

    /**
     * Maps InvoiceRequestDto to Invoice Entity.
     *
     * @param dto the invoice request details
     * @return the mapped Invoice entity
     */
    public Invoice toEntity(InvoiceRequestDto dto){
        if (dto == null) {
            return null;
        }
        Invoice invoice = new Invoice();
        invoice.setContractId(dto.contractId());
        invoice.setTotalAmount(dto.totalAmount());
        invoice.setDueDate(dto.dueDate());
        invoice.setStatus(dto.status());
        invoice.setTransactionId(dto.transactionId());
        return invoice;
    }
}
