import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { venueService } from '../../../services/venue/venueService'
import { bookingService } from '../../../services/booking/bookingService'
import { resourceSource } from '../../../services/resource/resourceService'
import type {
  VenueResponseDto,
  VenueRequestDto,
  AvailabilityStatus,
  BookingResponseVenueManagerDto,
  BookingStatus,
  ResourceResponseDto,
  ResourceRequestDto,
} from '../../../types/venue'

/* ── State ──────────────────────────────────────────────────────────────────── */
interface VenueState {
  venues: VenueResponseDto[]
  venuesLoading: boolean
  venuesError: string | null

  bookings: BookingResponseVenueManagerDto[]
  bookingsLoading: boolean
  bookingsError: string | null

  resources: ResourceResponseDto[]
  resourcesLoading: boolean
  resourcesError: string | null

  actionError: string | null
  actionLoading: boolean
}

const initialState: VenueState = {
  venues: [],
  venuesLoading: false,
  venuesError: null,

  bookings: [],
  bookingsLoading: false,
  bookingsError: null,

  resources: [],
  resourcesLoading: false,
  resourcesError: null,

  actionError: null,
  actionLoading: false,
}

/* ── Async Thunks ───────────────────────────────────────────────────────────── */

export const fetchAllVenues = createAsyncThunk(
  'venue/fetchAllVenues',
  async (_, { rejectWithValue }) => {
    try { return await venueService.getAllVenues() }
    catch (err: unknown) { return rejectWithValue((err as Error).message) }
  },
)

export const fetchVenuesByManager = createAsyncThunk(
  'venue/fetchVenuesByManager',
  async (managerId: string, { rejectWithValue }) => {
    try { return await venueService.getVenuesByManager(managerId) }
    catch (err: unknown) { return rejectWithValue((err as Error).message) }
  },
)

export const createVenue = createAsyncThunk(
  'venue/createVenue',
  async (payload: VenueRequestDto, { rejectWithValue }) => {
    try { return await venueService.addVenue(payload) }
    catch (err: unknown) { return rejectWithValue((err as Error).message) }
  },
)

export const updateVenue = createAsyncThunk(
  'venue/updateVenue',
  async ({ venueId, payload }: { venueId: string; payload: VenueRequestDto }, { rejectWithValue }) => {
    try { return await venueService.updateVenue(venueId, payload) }
    catch (err: unknown) { return rejectWithValue((err as Error).message) }
  },
)

export const deleteVenue = createAsyncThunk(
  'venue/deleteVenue',
  async (venueId: string, { rejectWithValue }) => {
    try { await venueService.deleteVenue(venueId); return venueId }
    catch (err: unknown) { return rejectWithValue((err as Error).message) }
  },
)

export const updateVenueStatus = createAsyncThunk(
  'venue/updateVenueStatus',
  async ({ venueId, status }: { venueId: string; status: AvailabilityStatus }, { rejectWithValue }) => {
    try { return await venueService.updateVenueStatus(venueId, status) }
    catch (err: unknown) { return rejectWithValue((err as Error).message) }
  },
)

export const fetchBookingsByVenue = createAsyncThunk(
  'venue/fetchBookingsByVenue',
  async (venueId: string, { rejectWithValue }) => {
    try { return await bookingService.getBookingsByVenue(venueId) }
    catch (err: unknown) { return rejectWithValue((err as Error).message) }
  },
)

export const updateBookingStatus = createAsyncThunk(
  'venue/updateBookingStatus',
  async ({ bookingId, status }: { bookingId: string; status: BookingStatus }, { rejectWithValue }) => {
    try { return await bookingService.updateBookingStatus(bookingId, status) }
    catch (err: unknown) { return rejectWithValue((err as Error).message) }
  },
)

export const fetchResourcesByVenue = createAsyncThunk(
  'venue/fetchResourcesByVenue',
  async (venueId: string, { rejectWithValue }) => {
    try { return await resourceSource.getResourcesByVenue(venueId) }
    catch (err: unknown) { return rejectWithValue((err as Error).message) }
  },
)





export const createResource = createAsyncThunk(
  'venue/createResource',
  async ({ venueId, payload }: { venueId: string; payload: ResourceRequestDto }, { rejectWithValue }) => {
    try { return await resourceSource.createResource(venueId, payload) }
    catch (err: unknown) { return rejectWithValue((err as Error).message) }
  },
)

export const updateResource = createAsyncThunk(
  'venue/updateResource',
  async ({ resourceId, payload }: { resourceId: string; payload: ResourceRequestDto }, { rejectWithValue }) => {
    try { return await resourceSource.updateResource(resourceId, payload) }
    catch (err: unknown) { return rejectWithValue((err as Error).message) }
  },
)

export const deleteResource = createAsyncThunk(
  'venue/deleteResource',
  async (resourceId: string, { rejectWithValue }) => {
    try { await resourceSource.deleteResource(resourceId); return resourceId }
    catch (err: unknown) { return rejectWithValue((err as Error).message) }
  },
)

/* ── Slice ──────────────────────────────────────────────────────────────────── */
const venueSlice = createSlice({
  name: 'venue',
  initialState,
  reducers: {
    clearActionError(state) { state.actionError = null },
    clearBookings(state)    { state.bookings = []; state.bookingsError = null },
    clearResources(state)   { state.resources = []; state.resourcesError = null },
  },
  extraReducers: (builder) => {
    builder
      // ── fetchAllVenues ────────────────────────────────────────────────────
      .addCase(fetchAllVenues.pending,    (state) => { state.venuesLoading = true; state.venuesError = null })
      .addCase(fetchAllVenues.fulfilled,  (state, action) => { state.venuesLoading = false; state.venues = action.payload })
      .addCase(fetchAllVenues.rejected,   (state, action) => { state.venuesLoading = false; state.venuesError = action.payload as string })

      // ── fetchVenuesByManager ──────────────────────────────────────────────
      .addCase(fetchVenuesByManager.pending,   (state) => { state.venuesLoading = true; state.venuesError = null })
      .addCase(fetchVenuesByManager.fulfilled, (state, action) => { state.venuesLoading = false; state.venues = action.payload })
      .addCase(fetchVenuesByManager.rejected,  (state, action) => { state.venuesLoading = false; state.venuesError = action.payload as string })

      // ── createVenue ───────────────────────────────────────────────────────
      .addCase(createVenue.pending,   (state) => { state.actionLoading = true; state.actionError = null })
      .addCase(createVenue.fulfilled, (state, action) => { state.actionLoading = false; state.venues.push(action.payload) })
      .addCase(createVenue.rejected,  (state, action) => { state.actionLoading = false; state.actionError = action.payload as string })

      // ── updateVenue ───────────────────────────────────────────────────────
      .addCase(updateVenue.pending,   (state) => { state.actionLoading = true; state.actionError = null })
      .addCase(updateVenue.fulfilled, (state, action) => {
        state.actionLoading = false
        const idx = state.venues.findIndex((v) => v.id === action.payload.id)
        if (idx !== -1) state.venues[idx] = action.payload
      })
      .addCase(updateVenue.rejected,  (state, action) => { state.actionLoading = false; state.actionError = action.payload as string })

      // ── deleteVenue ───────────────────────────────────────────────────────
      .addCase(deleteVenue.pending,   (state) => { state.actionLoading = true; state.actionError = null })
      .addCase(deleteVenue.fulfilled, (state, action) => {
        state.actionLoading = false
        state.venues = state.venues.filter((v) => v.id !== action.payload)
      })
      .addCase(deleteVenue.rejected,  (state, action) => { state.actionLoading = false; state.actionError = action.payload as string })

      // ── updateVenueStatus ─────────────────────────────────────────────────
      .addCase(updateVenueStatus.pending,   (state) => { state.actionLoading = true; state.actionError = null })
      .addCase(updateVenueStatus.fulfilled, (state, action) => {
        state.actionLoading = false
        const idx = state.venues.findIndex((v) => v.id === action.payload.id)
        if (idx !== -1) state.venues[idx] = action.payload
      })
      .addCase(updateVenueStatus.rejected,  (state, action) => { state.actionLoading = false; state.actionError = action.payload as string })

      // ── fetchBookingsByVenue ──────────────────────────────────────────────
      .addCase(fetchBookingsByVenue.pending,   (state) => { state.bookingsLoading = true; state.bookingsError = null })
      .addCase(fetchBookingsByVenue.fulfilled, (state, action) => { state.bookingsLoading = false; state.bookings = action.payload })
      .addCase(fetchBookingsByVenue.rejected,  (state, action) => { state.bookingsLoading = false; state.bookingsError = action.payload as string })

      // ── updateBookingStatus ───────────────────────────────────────────────
      .addCase(updateBookingStatus.pending,   (state) => { state.actionLoading = true; state.actionError = null })
      .addCase(updateBookingStatus.fulfilled, (state, action) => {
        state.actionLoading = false
        const idx = state.bookings.findIndex((b) => b.bookingId === action.payload.bookingId)
        if (idx !== -1) state.bookings[idx].status = action.payload.status
      })
      .addCase(updateBookingStatus.rejected,  (state, action) => { state.actionLoading = false; state.actionError = action.payload as string })

      // ── fetchResourcesByVenue ─────────────────────────────────────────────
      .addCase(fetchResourcesByVenue.pending,   (state) => { state.resourcesLoading = true; state.resourcesError = null })
      .addCase(fetchResourcesByVenue.fulfilled, (state, action) => { state.resourcesLoading = false; state.resources = action.payload })
      .addCase(fetchResourcesByVenue.rejected,  (state, action) => { state.resourcesLoading = false; state.resourcesError = action.payload as string })

      // ── createResource ────────────────────────────────────────────────────
      .addCase(createResource.pending,   (state) => { state.actionLoading = true; state.actionError = null })
      .addCase(createResource.fulfilled, (state, action) => { state.actionLoading = false; state.resources.push(action.payload) })
      .addCase(createResource.rejected,  (state, action) => { state.actionLoading = false; state.actionError = action.payload as string })

      // ── updateResource ────────────────────────────────────────────────────
      .addCase(updateResource.pending,   (state) => { state.actionLoading = true; state.actionError = null })
      .addCase(updateResource.fulfilled, (state, action) => {
        state.actionLoading = false
        const idx = state.resources.findIndex((r) => r.resourceId === action.payload.resourceId)
        if (idx !== -1) state.resources[idx] = action.payload
      })
      .addCase(updateResource.rejected,  (state, action) => { state.actionLoading = false; state.actionError = action.payload as string })

      // ── deleteResource ────────────────────────────────────────────────────
      .addCase(deleteResource.pending,   (state) => { state.actionLoading = true; state.actionError = null })
      .addCase(deleteResource.fulfilled, (state, action) => {
        state.actionLoading = false
        state.resources = state.resources.filter((r) => r.resourceId !== action.payload)
      })
      .addCase(deleteResource.rejected,  (state, action) => { state.actionLoading = false; state.actionError = action.payload as string })
  },
})

export const { clearActionError, clearBookings, clearResources } = venueSlice.actions
export default venueSlice.reducer
