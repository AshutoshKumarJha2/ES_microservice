import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { vendorService } from '../../../services/vendor/vendorService'
import { contractService } from '../../../services/vendor/contractService'
import { deliveryService } from '../../../services/vendor/deliveryService'
import { invoiceService } from '../../../services/vendor/invoiceService'
import type {
  VendorResponseDto,
  VendorRequestDto,
  ContractResponseDto,
  ContractRequestDto,
  ContractStatus,
  DeliveryResponseDto,
  DeliveryRequestDto,
  DeliveryStatus,
  InvoiceResponseDto,
  InvoiceRequestDto,
} from '../../../types/vendor'

// ── Vendor Thunks ──────────────────────────────────────────────────────────────

export const fetchAllVendors = createAsyncThunk(
  'vendor/fetchAll',
  async (_, { rejectWithValue }) => {
    try { return await vendorService.getAllVendors() }
    catch (err) { return rejectWithValue((err as Error).message) }
  }
)

export const createVendor = createAsyncThunk(
  'vendor/create',
  async (payload: VendorRequestDto, { rejectWithValue }) => {
    try { return await vendorService.createVendor(payload) }
    catch (err) { return rejectWithValue((err as Error).message) }
  }
)

export const updateVendor = createAsyncThunk(
  'vendor/update',
  async ({ vendorId, payload }: { vendorId: string; payload: VendorRequestDto }, { rejectWithValue }) => {
    try { return await vendorService.updateVendor(vendorId, payload) }
    catch (err) { return rejectWithValue((err as Error).message) }
  }
)

export const deleteVendor = createAsyncThunk(
  'vendor/delete',
  async (vendorId: string, { rejectWithValue }) => {
    try {
      await vendorService.deleteVendor(vendorId)
      return vendorId
    } catch (err) { return rejectWithValue((err as Error).message) }
  }
)

// ── Contract Thunks ────────────────────────────────────────────────────────────

export const fetchAllContracts = createAsyncThunk(
  'vendor/contracts/fetchAll',
  async (_, { rejectWithValue }) => {
    try { return await contractService.getAllContracts() }
    catch (err) { return rejectWithValue((err as Error).message) }
  }
)

export const createContract = createAsyncThunk(
  'vendor/contracts/create',
  async (payload: ContractRequestDto, { rejectWithValue }) => {
    try { return await contractService.createContract(payload) }
    catch (err) { return rejectWithValue((err as Error).message) }
  }
)

export const updateContract = createAsyncThunk(
  'vendor/contracts/update',
  async ({ contractId, payload }: { contractId: string; payload: ContractRequestDto }, { rejectWithValue }) => {
    try { return await contractService.updateContract(contractId, payload) }
    catch (err) { return rejectWithValue((err as Error).message) }
  }
)

export const updateContractStatus = createAsyncThunk(
  'vendor/contracts/updateStatus',
  async ({ contractId, status }: { contractId: string; status: ContractStatus }, { rejectWithValue }) => {
    try { return await contractService.updateContractStatus(contractId, status) }
    catch (err) { return rejectWithValue((err as Error).message) }
  }
)

export const deleteContract = createAsyncThunk(
  'vendor/contracts/delete',
  async (contractId: string, { rejectWithValue }) => {
    try {
      await contractService.deleteContract(contractId)
      return contractId
    } catch (err) { return rejectWithValue((err as Error).message) }
  }
)

export const createInvoiceViaContract = createAsyncThunk(
  'vendor/contracts/createInvoice',
  async ({ contractId, payload }: { contractId: string; payload: InvoiceRequestDto }, { rejectWithValue }) => {
    try { return await contractService.createInvoiceForContract(contractId, payload) }
    catch (err) { return rejectWithValue((err as Error).message) }
  }
)

export const addDeliveryViaContract = createAsyncThunk(
  'vendor/contracts/addDelivery',
  async ({ contractId, payload }: { contractId: string; payload: DeliveryRequestDto }, { rejectWithValue }) => {
    try { return await contractService.addDeliveryToContract(contractId, payload) }
    catch (err) { return rejectWithValue((err as Error).message) }
  }
)

// ── Delivery Thunks ────────────────────────────────────────────────────────────

export const fetchAllDeliveries = createAsyncThunk(
  'vendor/deliveries/fetchAll',
  async (_, { rejectWithValue }) => {
    try { return await deliveryService.getAllDeliveries() }
    catch (err) { return rejectWithValue((err as Error).message) }
  }
)

export const createDelivery = createAsyncThunk(
  'vendor/deliveries/create',
  async (payload: DeliveryRequestDto, { rejectWithValue }) => {
    try { return await deliveryService.createDelivery(payload) }
    catch (err) { return rejectWithValue((err as Error).message) }
  }
)

export const updateDelivery = createAsyncThunk(
  'vendor/deliveries/update',
  async ({ deliveryId, payload }: { deliveryId: string; payload: DeliveryRequestDto }, { rejectWithValue }) => {
    try { return await deliveryService.updateDelivery(deliveryId, payload) }
    catch (err) { return rejectWithValue((err as Error).message) }
  }
)

export const updateDeliveryStatus = createAsyncThunk(
  'vendor/deliveries/updateStatus',
  async ({ deliveryId, status }: { deliveryId: string; status: DeliveryStatus }, { rejectWithValue }) => {
    try { return await deliveryService.updateDeliveryStatus(deliveryId, status) }
    catch (err) { return rejectWithValue((err as Error).message) }
  }
)

export const deleteDelivery = createAsyncThunk(
  'vendor/deliveries/delete',
  async (deliveryId: string, { rejectWithValue }) => {
    try {
      await deliveryService.deleteDelivery(deliveryId)
      return deliveryId
    } catch (err) { return rejectWithValue((err as Error).message) }
  }
)

// ── Invoice Thunks ─────────────────────────────────────────────────────────────

export const fetchAllInvoices = createAsyncThunk(
  'vendor/invoices/fetchAll',
  async (_, { rejectWithValue }) => {
    try { return await invoiceService.getAllInvoices() }
    catch (err) { return rejectWithValue((err as Error).message) }
  }
)

export const createInvoice = createAsyncThunk(
  'vendor/invoices/create',
  async (payload: InvoiceRequestDto, { rejectWithValue }) => {
    try { return await invoiceService.createInvoice(payload) }
    catch (err) { return rejectWithValue((err as Error).message) }
  }
)

export const updateInvoice = createAsyncThunk(
  'vendor/invoices/update',
  async ({ invoiceId, payload }: { invoiceId: string; payload: InvoiceRequestDto }, { rejectWithValue }) => {
    try { return await invoiceService.updateInvoice(invoiceId, payload) }
    catch (err) { return rejectWithValue((err as Error).message) }
  }
)

export const deleteInvoice = createAsyncThunk(
  'vendor/invoices/delete',
  async (invoiceId: string, { rejectWithValue }) => {
    try {
      await invoiceService.deleteInvoice(invoiceId)
      return invoiceId
    } catch (err) { return rejectWithValue((err as Error).message) }
  }
)

// ── State Shape ────────────────────────────────────────────────────────────────

interface VendorState {
  vendors: VendorResponseDto[]
  vendorsLoading: boolean
  vendorsError: string | null

  contracts: ContractResponseDto[]
  contractsLoading: boolean
  contractsError: string | null

  deliveries: DeliveryResponseDto[]
  deliveriesLoading: boolean
  deliveriesError: string | null

  invoices: InvoiceResponseDto[]
  invoicesLoading: boolean
  invoicesError: string | null
}

const initialState: VendorState = {
  vendors: [],
  vendorsLoading: false,
  vendorsError: null,

  contracts: [],
  contractsLoading: false,
  contractsError: null,

  deliveries: [],
  deliveriesLoading: false,
  deliveriesError: null,

  invoices: [],
  invoicesLoading: false,
  invoicesError: null,
}

// ── Slice ──────────────────────────────────────────────────────────────────────

const vendorSlice = createSlice({
  name: 'vendor',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Vendors
    builder
      .addCase(fetchAllVendors.pending, (s) => { s.vendorsLoading = true; s.vendorsError = null })
      .addCase(fetchAllVendors.fulfilled, (s, a) => { s.vendorsLoading = false; s.vendors = a.payload })
      .addCase(fetchAllVendors.rejected, (s, a) => { s.vendorsLoading = false; s.vendorsError = a.payload as string })

      .addCase(createVendor.fulfilled, (s, a) => { s.vendors.push(a.payload) })
      .addCase(updateVendor.fulfilled, (s, a) => {
        const idx = s.vendors.findIndex(v => v.vendorId === a.payload.vendorId)
        if (idx !== -1) s.vendors[idx] = a.payload
      })
      .addCase(deleteVendor.fulfilled, (s, a) => {
        s.vendors = s.vendors.filter(v => v.vendorId !== a.payload)
      })

    // Contracts
    builder
      .addCase(fetchAllContracts.pending, (s) => { s.contractsLoading = true; s.contractsError = null })
      .addCase(fetchAllContracts.fulfilled, (s, a) => { s.contractsLoading = false; s.contracts = a.payload })
      .addCase(fetchAllContracts.rejected, (s, a) => { s.contractsLoading = false; s.contractsError = a.payload as string })

      .addCase(createContract.fulfilled, (s, a) => { s.contracts.push(a.payload) })
      .addCase(updateContract.fulfilled, (s, a) => {
        const idx = s.contracts.findIndex(c => c.contractId === a.payload.contractId)
        if (idx !== -1) s.contracts[idx] = a.payload
      })
      .addCase(updateContractStatus.fulfilled, (s, a) => {
        const idx = s.contracts.findIndex(c => c.contractId === a.payload.contractId)
        if (idx !== -1) s.contracts[idx] = a.payload
      })
      .addCase(deleteContract.fulfilled, (s, a) => {
        s.contracts = s.contracts.filter(c => c.contractId !== a.payload)
      })
      .addCase(createInvoiceViaContract.fulfilled, (s, a) => { s.invoices.push(a.payload) })
      .addCase(addDeliveryViaContract.fulfilled, (s, a) => { s.deliveries.push(a.payload) })

    // Deliveries
    builder
      .addCase(fetchAllDeliveries.pending, (s) => { s.deliveriesLoading = true; s.deliveriesError = null })
      .addCase(fetchAllDeliveries.fulfilled, (s, a) => { s.deliveriesLoading = false; s.deliveries = a.payload })
      .addCase(fetchAllDeliveries.rejected, (s, a) => { s.deliveriesLoading = false; s.deliveriesError = a.payload as string })

      .addCase(createDelivery.fulfilled, (s, a) => { s.deliveries.push(a.payload) })
      .addCase(updateDelivery.fulfilled, (s, a) => {
        const idx = s.deliveries.findIndex(d => d.deliveryId === a.payload.deliveryId)
        if (idx !== -1) s.deliveries[idx] = a.payload
      })
      .addCase(updateDeliveryStatus.fulfilled, (s, a) => {
        const idx = s.deliveries.findIndex(d => d.deliveryId === a.payload.deliveryId)
        if (idx !== -1) s.deliveries[idx] = a.payload
      })
      .addCase(deleteDelivery.fulfilled, (s, a) => {
        s.deliveries = s.deliveries.filter(d => d.deliveryId !== a.payload)
      })

    // Invoices
    builder
      .addCase(fetchAllInvoices.pending, (s) => { s.invoicesLoading = true; s.invoicesError = null })
      .addCase(fetchAllInvoices.fulfilled, (s, a) => { s.invoicesLoading = false; s.invoices = a.payload })
      .addCase(fetchAllInvoices.rejected, (s, a) => { s.invoicesLoading = false; s.invoicesError = a.payload as string })

      .addCase(createInvoice.fulfilled, (s, a) => { s.invoices.push(a.payload) })
      .addCase(updateInvoice.fulfilled, (s, a) => {
        const idx = s.invoices.findIndex(i => i.invoiceId === a.payload.invoiceId)
        if (idx !== -1) s.invoices[idx] = a.payload
      })
      .addCase(deleteInvoice.fulfilled, (s, a) => {
        s.invoices = s.invoices.filter(i => i.invoiceId !== a.payload)
      })
  },
})

export default vendorSlice.reducer
