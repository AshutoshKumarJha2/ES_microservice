import { configureStore } from '@reduxjs/toolkit'
import eventsReducer from './slices/eventsSlice'
import ticketsReducer from './slices/ticketsSlice'
import registrationsReducer from './slices/registrationsSlice'
import budgetReducer from './slices/budgetSlice'
import analyticsReducer from './slices/analyticsSlice'
import authReducer from './slices/authSlice'
import uiReducer from './slices/uiSlice'
import financeReducer from './slices/Finance/financeSlice'
import adminReducer from './slices/adminSlice'
import notificationsReducer from './slices/notificationsSlice'
import venueReducer from './slices/venue/venueSlice'
import vendorReducer from './slices/vendor/vendorSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    admin: adminReducer,
    events: eventsReducer,
    tickets: ticketsReducer,
    registrations: registrationsReducer,
    budget: budgetReducer,
    analytics: analyticsReducer,
    finance: financeReducer,
    notifications: notificationsReducer,
    venue: venueReducer,
    vendor: vendorReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
