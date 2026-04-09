import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './App.css'
import { Home } from './components/pages/Home'
import { Contact } from './components/pages/Contact'
import { About } from './components/pages/About'
import { AppLayout } from './components/layout/AppLayout'
import { AuthenticatedLayout } from './components/layout/AuthenticatedLayout'
import { ProtectedRoute } from './components/elements/auth/ProtectedRoute'
import { AdminRoute } from './components/elements/auth/AdminRoute'
import { Register } from './components/pages/auth/Register'
import { Login } from './components/pages/auth/Login'
import { Dashboard } from './components/pages/Dashboard'
import { OrganizerDashboard } from './components/pages/events/OrganizerDashboard'
import { CreateEvent } from './components/pages/events/CreateEvent'
import { EventDetail } from './components/pages/events/EventDetail'
import { Analytics } from './components/pages/events/Analytics'
import { AdminDashboard } from './components/pages/admin/AdminDashboard'
import { AdminUsers } from './components/pages/admin/AdminUsers'
import { AdminEvents } from './components/pages/admin/AdminEvents'
import { AdminAuditLogs } from './components/pages/admin/AdminAuditLogs'

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
            { path: 'dashboard', element: <Dashboard /> },
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
          ],
        },
      ],
    },

    // ── Admin pages (AppLayout + ADMIN role guard) ─────────────────────────────
    {
      element: <AdminRoute />,
      children: [
        {
          element: <AppLayout />,
          children: [
            { path: '/admin/dashboard',  element: <AdminDashboard /> },
            { path: '/admin/users',      element: <AdminUsers /> },
            { path: '/admin/events',     element: <AdminEvents /> },
            { path: '/admin/audit-logs', element: <AdminAuditLogs /> },
          ],
        },
      ],
    },
  ])

  return <RouterProvider router={router} />
}
