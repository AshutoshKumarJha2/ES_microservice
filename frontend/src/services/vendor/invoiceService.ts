import axiosInstance from '../../api/axiosInstance'
import type { InvoiceRequestDto, InvoiceResponseDto } from '../../types/vendor'

const BASE = '/api/v1/vendor-manager/api/v1'

export const invoiceService = {
  async createInvoice(payload: InvoiceRequestDto): Promise<InvoiceResponseDto> {
    const { data } = await axiosInstance.post(`${BASE}/invoices`, payload)
    return data
  },

  async getAllInvoices(): Promise<InvoiceResponseDto[]> {
    const { data } = await axiosInstance.get(`${BASE}/invoices`)
    return data
  },

  async getInvoiceById(invoiceId: string): Promise<InvoiceResponseDto> {
    const { data } = await axiosInstance.get(`${BASE}/invoices/${invoiceId}`)
    return data
  },

  async updateInvoice(invoiceId: string, payload: InvoiceRequestDto): Promise<InvoiceResponseDto> {
    const { data } = await axiosInstance.put(`${BASE}/invoices/${invoiceId}`, payload)
    return data
  },

  async deleteInvoice(invoiceId: string): Promise<void> {
    await axiosInstance.delete(`${BASE}/invoices/${invoiceId}`)
  },

  async downloadInvoicePdf(invoiceId: string): Promise<Blob> {
    const { data } = await axiosInstance.get(`${BASE}/invoices/${invoiceId}/pdf`, {
      responseType: 'blob',
    })
    return data
  },
}
