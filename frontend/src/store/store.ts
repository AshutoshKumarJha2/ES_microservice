import { configureStore } from '@reduxjs/toolkit'
import eventsReducer from './slices/eventsSlice'
import ticketsReducer from './slices/ticketsSlice'
import registrationsReducer from './slices/registrationsSlice'
import budgetReducer from './slices/budgetSlice'
import analyticsReducer from './slices/analyticsSlice'

export const store = configureStore({
  reducer: {
    events: eventsReducer,
    tickets: ticketsReducer,
    registrations: registrationsReducer,
    budget: budgetReducer,
    analytics: analyticsReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
