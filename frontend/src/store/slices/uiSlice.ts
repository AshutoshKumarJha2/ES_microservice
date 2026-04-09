import { createSlice } from '@reduxjs/toolkit'

type Theme = 'light' | 'dark'

interface UIState {
  theme: Theme
  sidebarCollapsed: boolean
}

const savedTheme = (localStorage.getItem('theme') as Theme) || 'light'
document.documentElement.setAttribute('data-theme', savedTheme)

const initialState: UIState = {
  theme: savedTheme,
  sidebarCollapsed: false,
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light'
      localStorage.setItem('theme', state.theme)
      document.documentElement.setAttribute('data-theme', state.theme)
    },
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed
    },
    setSidebarCollapsed: (state, action: { payload: boolean }) => {
      state.sidebarCollapsed = action.payload
    },
  },
})

export const { toggleTheme, toggleSidebar, setSidebarCollapsed } = uiSlice.actions
export default uiSlice.reducer
