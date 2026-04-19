import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { ToastContainer, Bounce } from 'react-toastify'
import './App.css'
import { Home } from './components/pages/Home'
import { Contact } from './components/pages/Contact'
import { About } from './components/pages/About'
import { AppLayout } from './components/layout/AppLayout'
import { ProtectedRoute } from './components/elements/auth/ProtectedRoute'
import { AdminRoute } from './components/elements/auth/AdminRoute'
import { Register } from './components/pages/auth/Register'
import { Login } from './components/pages/auth/Login'
import { Profile } from './components/pages/auth/Profile'
import { Dashboard } from './components/pages/Dashboard'
import { OrganizerDashboard } from './components/pages/events/OrganizerDashboard'
import { EventDetail } from './components/pages/events/EventDetail'
import { SubmitFeedback } from './components/pages/engagement/SubmitFeedback'
import { EngagementAnalytics } from './components/pages/engagement/EngagementAnalytics'
import { FinanceLayout } from './components/layout/FinanceLayout'
import { ExpenseApprovals } from './components/pages/finance/ExpenseApprovals'
import { Payments } from './components/pages/finance/Payments'
import { BudgetOverview } from './components/pages/finance/BudgetOverview'
import { NotificationCenter } from './components/pages/notifications/NotificationCenter'
import { AdminDashboard } from './components/pages/admin/AdminDashboard'
import { AdminUsers } from './components/pages/admin/AdminUsers'
import { AdminEvents } from './components/pages/admin/AdminEvents'
import { AdminAuditLogs } from './components/pages/admin/AdminAuditLogs'
import { AttendeeEventBrowser } from './components/pages/attendee/AttendeeEventBrowser'
import { AttendeeEventDetail } from './components/pages/attendee/AttendeeEventDetail'
import { AttendeeMyRegistrations } from './components/pages/attendee/AttendeeMyRegistrations'

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

    // ── Public pages (no auth required) ───────────────────────────────────────
    {
      element: <AppLayout />,
      children: [
        { path: '/',        element: <Home /> },
        { path: '/about',   element: <About /> },
        { path: '/contact', element: <Contact /> },
      ],
    },

    // ── Protected pages (auth required, basic header + footer) ────────────────
    {
      element: <ProtectedRoute />,
      children: [
        {
          element: <AppLayout />,
          children: [
            { path: '/dashboard',     element: <Dashboard /> },
            { path: '/profile',       element: <Profile /> },
            { path: '/notifications', element: <NotificationCenter /> },
          ],
        },
      ],
    },

    // ── Organizer pages (AppLayout — global header, no sidebar) ──────────────
    {
      element: <ProtectedRoute />,
      children: [
        {
          element: <AppLayout />,
          children: [
            { path: '/organizer/dashboard',         element: <OrganizerDashboard /> },
            { path: '/organizer/events/:id',         element: <EventDetail /> },
            { path: '/organizer/analytics/:eventId', element: <EngagementAnalytics /> },
            { path: '/attendee/feedback/:eventId',   element: <SubmitFeedback /> },
            { path: '/events',                       element: <AttendeeEventBrowser /> },
            { path: '/attendee/events/:id',          element: <AttendeeEventDetail /> },
            { path: '/attendee/registrations',       element: <AttendeeMyRegistrations /> },
          ],
        },
      ],
    },

    // ── Finance Officer Portal (separate layout) ──────────────────────────────
    {
      path: '/finance',
      element: <FinanceLayout />,
      children: [
        { path: 'expenses', element: <ExpenseApprovals /> },
        { path: 'payments', element: <Payments /> },
        { path: 'budget', element: <BudgetOverview /> },
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

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition={Bounce}
      />
      <RouterProvider router={router} />
    </>
  )
}
