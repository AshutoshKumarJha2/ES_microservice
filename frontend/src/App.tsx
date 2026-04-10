import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './App.css'
import { Home } from './components/pages/Home'
import { Contact } from './components/pages/Contact'
import { About } from './components/pages/About'
import { AppLayout } from './components/layout/AppLayout'
import { AuthenticatedLayout } from './components/layout/AuthenticatedLayout'
import { ProtectedRoute } from './components/elements/auth/ProtectedRoute'
import { Register } from './components/pages/auth/Register'
import { Login } from './components/pages/auth/Login'
import { OrganizerDashboard } from './components/pages/events/OrganizerDashboard'
import { CreateEvent } from './components/pages/events/CreateEvent'
import { EventDetail } from './components/pages/events/EventDetail'
import { Analytics } from './components/pages/events/Analytics'
import { SubmitFeedback } from './components/pages/events/SubmitFeedback'

export const App = () => {
  const router = createBrowserRouter([
    // ── Standalone auth pages (no layout wrapper) ──────────────────────────────
    {
      path: '/login',
      element: <Login />,
    },
    {
      path: '/register',
      element: <Register />,
    },

    // ── Public pages (require login, basic header + footer) ───────────────────
    {
      element: <ProtectedRoute />,
      children: [
        {
          path: '/',
          element: <AppLayout />,
          children: [
            { index: true, element: <Home /> },
            { path: 'contact', element: <Contact /> },
            { path: 'about', element: <About /> },
          ],
        },
      ],
    },

    // ── Protected pages (sidebar + top header) ─────────────────────────────────
    {
      element: <ProtectedRoute />,
      children: [
        {
          element: <AuthenticatedLayout />,
          children: [
            // Organizer
            { path: '/organizer/dashboard',         element: <OrganizerDashboard /> },
            { path: '/organizer/events/create',      element: <CreateEvent /> },
            { path: '/organizer/events/:id/edit',    element: <CreateEvent /> },
            { path: '/organizer/events/:id',         element: <EventDetail /> },
            { path: '/organizer/analytics/:eventId', element: <Analytics /> },
            {path:'/attendee/feedback/:eventId',element:<SubmitFeedback />},
          ],
        },
      ],
    },
  ])

  return <RouterProvider router={router} />
}
