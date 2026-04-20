export type VendorStatus = 'ACTIVE' | 'INACTIVE' | 'BLACKLISTED'
export type ContractStatus = 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'TERMINATED'
export type DeliveryStatus = 'SCHEDULED' | 'IN_TRANSIT' | 'DELIVERED' | 'FAILED' | 'CANCELLED'
export type InvoiceStatus = 'ISSUED' | 'PAID' | 'OVERDUE' | 'CANCELLED'

export interface VendorRequestDto {
  name: string
  contactInfo: string
  status: VendorStatus
}

export interface VendorResponseDto {
  vendorId: string
  name: string
  contactInfo: string
  status: VendorStatus
  createdAt: string
  updatedAt: string
}

export interface ContractRequestDto {
  vendorId: string
  eventId: string
  startDate: string
  endDate: string
  value: number
  status: ContractStatus
}

export interface ContractResponseDto {
  contractId: string
  vendorId: string
  eventId: string
  startDate: string
  endDate: string
  value: number
  status: ContractStatus
  createdAt: string
  updatedAt: string
}

export interface DeliveryRequestDto {
  invoiceId: string
  item: string
  quantity: number
  deliveryDate: string
  status: DeliveryStatus
  trackingNumber: string
}

export interface DeliveryResponseDto {
  deliveryId: string
  invoiceId: string
  item: string
  quantity: number
  deliveryDate: string
  status: DeliveryStatus
  trackingNumber: string
  createdAt: string
  updatedAt: string
}

export interface InvoiceRequestDto {
  contractId: string
  totalAmount: number
  dueDate: string
  status: InvoiceStatus
  transactionId?: string
}

export interface InvoiceResponseDto {
  invoiceId: string
  contractId: string
  transactionId: string | null
  issueDate: string
  totalAmount: number
  dueDate: string
  status: InvoiceStatus
  createdAt: string
  updatedAt: string
}
