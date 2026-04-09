import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './App.css'
import { Home } from './components/pages/Home'
import { Contact } from './components/pages/Contact'
import { About } from './components/pages/About'
import { AppLayout } from './components/layout/AppLayout'
import { Register } from './components/pages/auth/Register'
import { Login } from './components/pages/auth/Login'
import { OrganizerDashboard } from './components/pages/events/OrganizerDashboard'
import { CreateEvent } from './components/pages/events/CreateEvent'
import { EventDetail } from './components/pages/events/EventDetail'
import { Analytics } from './components/pages/events/Analytics'
import { SubmitFeedback } from './components/pages/events/SubmitFeedback'

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
      },
      {
        path:'/organizer/dashboard',
        element:<OrganizerDashboard />
      },
      {
        path:'/organizer/events/create',
        element:<CreateEvent />
      },
      {
        path:'/organizer/events/:id/edit',
        element:<CreateEvent />
      },
      {
        path:'/organizer/events/:id',
        element:<EventDetail />
      },
      {
        path:'/organizer/analytics/:eventId',
        element:<Analytics />
      },
      {
        path:'/attendee/feedback/:eventId',
        element:<SubmitFeedback />
      }
    ]
  }])

  return (
    <>
      <RouterProvider router={router} />
    </>
  )
}
