import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './App.css'
import { Home } from './components/pages/Home'
import { Contact } from './components/pages/Contact'
import { About } from './components/pages/About'
import { AppLayout } from './components/layout/AppLayout'
import { Register } from './components/pages/auth/Register'
import { Login } from './components/pages/auth/Login'

export const App = () => {

  const router = createBrowserRouter([{
    path:'/',
    element:<AppLayout />,
    children:[
      {
        path:'/',
        element:<Home />
      },
      {
        path:'/contact',
        element:<Contact />
      },
      {
        path:'/about',
        element:<About />
      },
      {
        path:'/register',
        element:<Register />
      },
      {
        path:'/login',
        element:<Login />
      }
    ]
  }])

  return (
    <>
      {/* <h1>Hello World</h1> */}
      <RouterProvider router={router} />
    </>
  )
}
