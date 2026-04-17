import axios from 'axios'
import type { InternalAxiosRequestConfig } from 'axios'
import type { Store } from '@reduxjs/toolkit'
import { jwtDecode } from 'jwt-decode'
import { logout, setTokens } from '../store/slices/authSlice'

const REFRESH_BUFFER_SECONDS = 30

function isTokenExpiringSoon(token: string): boolean {
  try {
    const { exp } = jwtDecode<{ exp?: number }>(token)
    if (!exp) return true
    return exp - Date.now() / 1000 < REFRESH_BUFFER_SECONDS
  } catch {
    return true
  }
}

function isTokenExpired(token: string): boolean {
  try {
    const { exp } = jwtDecode<{ exp?: number }>(token)
    if (!exp) return true
    return exp < Date.now() / 1000
  } catch {
    return true
  }
}

let _store: Store
export function injectStore(s: Store) {
  _store = s
}

const axiosInstance = axios.create({
  baseURL: 'http://localhost:6970',
  headers: {
    'Content-Type': 'application/json',
  },
})

const refreshClient = axios.create({
  baseURL: 'http://localhost:6970',
  headers: {
    'Content-Type': 'application/json',
  },
})

axiosInstance.interceptors.request.use(
  async (config) => {
    let token = localStorage.getItem('accessToken')
    if (token && isTokenExpiringSoon(token)) {
      try {
        token = await doRefresh()
      } catch (e) {
        return Promise.reject(e)
      }
    }
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string) => void
  reject: (err: unknown) => void
}> = []

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error)
    else resolve(token!)
  })
  failedQueue = []
}

function forceLogout() {
  delete axiosInstance.defaults.headers.common.Authorization
  _store.dispatch(logout())
}

async function doRefresh(): Promise<string> {
  const refreshToken = localStorage.getItem('refreshToken')
  if (!refreshToken || isTokenExpired(refreshToken)) {
    forceLogout()
    return Promise.reject(new Error('No valid refresh token'))
  }

  if (isRefreshing) {
    return new Promise<string>((resolve, reject) => {
      failedQueue.push({ resolve, reject })
    })
  }

  isRefreshing = true

  try {
    const { data } = await refreshClient.post(
      '/api/v1/auth-manager/auth/refresh',
      {},
      { headers: { Authorization: `Bearer ${refreshToken}` } }
    )

    localStorage.setItem('accessToken', data.accessToken)
    localStorage.setItem('refreshToken', data.refreshToken)

    _store.dispatch(setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken }))

    processQueue(null, data.accessToken)
    return data.accessToken as string
  } catch (refreshError: unknown) {
    processQueue(refreshError, null)
    forceLogout()
    return Promise.reject(refreshError)
  } finally {
    isRefreshing = false
  }
}

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error)
    }

    originalRequest._retry = true

    try {
      const newToken = await doRefresh()
      originalRequest.headers.Authorization = `Bearer ${newToken}`
      return axiosInstance(originalRequest)
    } catch (refreshError) {
      return Promise.reject(refreshError)
    }
  }
)

export function clearAuthHeader() {
  delete axiosInstance.defaults.headers.common.Authorization
}

export default axiosInstance
