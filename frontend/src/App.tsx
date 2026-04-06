import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './App.css'
import { Home } from './components/pages/Home'
import { Contact } from './components/pages/Contact'
import { About } from './components/pages/About'
import { AppLayout } from './components/layout/AppLayout'

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
