import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { resourceSource } from '../../services/resource/resourceService'
import type {
  ResourceRequestDto,
  ResourceResponseDto,
  ResourceAllocationRequestDto,
} from '../../types/venue'

interface ResourceState {
  resources: ResourceResponseDto[]
  venueResources: ResourceResponseDto[]
  selectedResource: ResourceResponseDto | null
  allocationMessage: string | null
  loading: boolean
  error: string | null
}

const initialState: ResourceState = {
  resources: [],
  venueResources: [],
  selectedResource: null,
  allocationMessage: null,
  loading: false,
  error: null,
}

export const fetchAllResources = createAsyncThunk(
  'resource/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return await resourceSource.getAllResources()
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string }
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch resources')
    }
  }
)

export const fetchResourceById = createAsyncThunk(
  'resource/fetchById',
  async (resourceId: string, { rejectWithValue }) => {
    try {
      return await resourceSource.getResourceById(resourceId)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string }
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch resource')
    }
  }
)

export const fetchResourcesByVenue = createAsyncThunk(
  'resource/fetchByVenue',
  async (venueId: string, { rejectWithValue }) => {
    try {
      return await resourceSource.getResourcesByVenue(venueId)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string }
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch venue resources')
    }
  }
)

export const createResource = createAsyncThunk(
  'resource/create',
  async ({ venueId, payload }: { venueId: string; payload: ResourceRequestDto }, { rejectWithValue }) => {
    try {
      return await resourceSource.createResource(venueId, payload)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string }
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to create resource')
    }
  }
)

export const updateResource = createAsyncThunk(
  'resource/update',
  async ({ resourceId, payload }: { resourceId: string; payload: ResourceRequestDto }, { rejectWithValue }) => {
    try {
      return await resourceSource.updateResource(resourceId, payload)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string }
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to update resource')
    }
  }
)

export const deleteResource = createAsyncThunk(
  'resource/delete',
  async (resourceId: string, { rejectWithValue }) => {
    try {
      await resourceSource.deleteResource(resourceId)
      return resourceId
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string }
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to delete resource')
    }
  }
)

export const requestAllocation = createAsyncThunk(
  'resource/requestAllocation',
  async (payload: ResourceAllocationRequestDto, { rejectWithValue }) => {
    try {
      return await resourceSource.requestAllocation(payload)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string }
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to request allocation')
    }
  }
)

export const approveRequestedAllocation = createAsyncThunk(
  'resource/vm-approve',
  async (eventId: string, { rejectWithValue }) => {
    try {
      return await resourceSource.approveAllocation(eventId)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string }
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to approve allocation')
    }
  }
)

const resourceSlice = createSlice({
  name: 'resource',
  initialState,
  reducers: {
    clearSelectedResource(state) {
      state.selectedResource = null
    },
    clearAllocationMessage(state) {
      state.allocationMessage = null
    },
    clearResourceError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchAllResources
      .addCase(fetchAllResources.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchAllResources.fulfilled, (state, action) => { state.loading = false; state.resources = action.payload })
      .addCase(fetchAllResources.rejected, (state, action) => { state.loading = false; state.error = action.payload as string })

      // fetchResourceById
      .addCase(fetchResourceById.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchResourceById.fulfilled, (state, action) => { state.loading = false; state.selectedResource = action.payload })
      .addCase(fetchResourceById.rejected, (state, action) => { state.loading = false; state.error = action.payload as string })

      // fetchResourcesByVenue
      .addCase(fetchResourcesByVenue.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchResourcesByVenue.fulfilled, (state, action) => { state.loading = false; state.venueResources = action.payload })
      .addCase(fetchResourcesByVenue.rejected, (state, action) => { state.loading = false; state.error = action.payload as string })

      // createResource
      .addCase(createResource.pending, (state) => { state.loading = true; state.error = null })
      .addCase(createResource.fulfilled, (state, action) => {
        state.loading = false
        state.resources.push(action.payload)
        state.venueResources.push(action.payload)
      })
      .addCase(createResource.rejected, (state, action) => { state.loading = false; state.error = action.payload as string })

      // updateResource
      .addCase(updateResource.pending, (state) => { state.loading = true; state.error = null })
      .addCase(updateResource.fulfilled, (state, action) => {
        state.loading = false
        const idx = state.resources.findIndex((r) => r.resourceId === action.payload.resourceId)
        if (idx !== -1) state.resources[idx] = action.payload
        const vidx = state.venueResources.findIndex((r) => r.resourceId === action.payload.resourceId)
        if (vidx !== -1) state.venueResources[vidx] = action.payload
        state.selectedResource = action.payload
      })
      .addCase(updateResource.rejected, (state, action) => { state.loading = false; state.error = action.payload as string })

      // deleteResource
      .addCase(deleteResource.pending, (state) => { state.loading = true; state.error = null })
      .addCase(deleteResource.fulfilled, (state, action) => {
        state.loading = false
        state.resources = state.resources.filter((r) => r.resourceId !== action.payload)
        state.venueResources = state.venueResources.filter((r) => r.resourceId !== action.payload)
      })
      .addCase(deleteResource.rejected, (state, action) => { state.loading = false; state.error = action.payload as string })

      // requestAllocation
      .addCase(requestAllocation.pending, (state) => { state.loading = true; state.error = null })
      .addCase(requestAllocation.fulfilled, (state, action) => { state.loading = false; state.allocationMessage = action.payload.message })
      .addCase(requestAllocation.rejected, (state, action) => { state.loading = false; state.error = action.payload as string })

      // approveRequestedAllocation
      .addCase(approveRequestedAllocation.pending, (state) => { state.loading = true; state.error = null })
      .addCase(approveRequestedAllocation.fulfilled, (state, action) => { state.loading = false; state.allocationMessage = action.payload.message })
      .addCase(approveRequestedAllocation.rejected, (state, action) => { state.loading = false; state.error = action.payload as string })
  },
})

export const { clearSelectedResource, clearAllocationMessage, clearResourceError } = resourceSlice.actions
export default resourceSlice.reducer
