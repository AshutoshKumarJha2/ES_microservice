import { useEffect } from 'react'


import { Outlet } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { fetchCurrentUser } from '../../store/slices/authSlice'
import { Header } from './Header'
import { Footer } from './Footer'

export const AppLayout = () => {
  const dispatch = useAppDispatch()
  const { user, accessToken } = useAppSelector((state) => state.auth)

  useEffect(() => {
    if (accessToken && !user) {
      dispatch(fetchCurrentUser())
    }
  }, [accessToken, user, dispatch])

  return (
    <>
      <Header />
      <Outlet />
      <Footer />
    </>
  )
}