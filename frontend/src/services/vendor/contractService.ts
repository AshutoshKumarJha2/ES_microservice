import axiosInstance from '../../api/axiosInstance'
import type {
  ContractRequestDto,
  ContractResponseDto,
  ContractStatus,
  DeliveryRequestDto,
  DeliveryResponseDto,
  InvoiceRequestDto,
  InvoiceResponseDto,
} from '../../types/vendor'

const BASE = '/api/v1/vendor-manager/api/v1'

export const contractService = {
  async createContract(payload: ContractRequestDto): Promise<ContractResponseDto> {
    const { data } = await axiosInstance.post(`${BASE}/contracts`, payload)
    return data
  },

  async getAllContracts(): Promise<ContractResponseDto[]> {
    const { data } = await axiosInstance.get(`${BASE}/contracts`)
    return data
  },

  async getContractById(contractId: string): Promise<ContractResponseDto> {
    const { data } = await axiosInstance.get(`${BASE}/contracts/${contractId}`)
    return data
  },

  async updateContract(contractId: string, payload: ContractRequestDto): Promise<ContractResponseDto> {
    const { data } = await axiosInstance.put(`${BASE}/contracts/${contractId}`, payload)
    return data
  },

  async updateContractStatus(contractId: string, status: ContractStatus): Promise<ContractResponseDto> {
    const { data } = await axiosInstance.patch(`${BASE}/contracts/${contractId}/status`, null, {
      params: { status },
    })
    return data
  },

  async deleteContract(contractId: string): Promise<void> {
    await axiosInstance.delete(`${BASE}/contracts/${contractId}`)
  },

  async createInvoiceForContract(contractId: string, payload: InvoiceRequestDto): Promise<InvoiceResponseDto> {
    const { data } = await axiosInstance.post(`${BASE}/contracts/${contractId}/invoice`, payload)
    return data
  },

  async addDeliveryToContract(contractId: string, payload: DeliveryRequestDto): Promise<DeliveryResponseDto> {
    const { data } = await axiosInstance.post(`${BASE}/contracts/${contractId}/deliveries`, payload)
    return data
  },
}
