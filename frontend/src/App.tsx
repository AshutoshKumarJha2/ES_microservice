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
import { FinanceDashboard } from './components/pages/finance/FinanceDashboard'
import { FinanceLayout } from './components/layout/FinanceLayout'
import { ExpenseApprovals } from './components/pages/finance/ExpenseApprovals'
import { Payments } from './components/pages/finance/Payments'
import { BudgetOverview } from './components/pages/finance/BudgetOverview'
import { NotificationCenter } from './components/pages/notifications/NotificationCenter'
import { AdminDashboard } from './components/pages/admin/AdminDashboard'
import { AdminUsers } from './components/pages/admin/AdminUsers'
import { AdminEvents } from './components/pages/admin/AdminEvents'
import { AdminAuditLogs } from './components/pages/admin/AdminAuditLogs'
import { AdminExpenses } from './components/pages/admin/AdminExpenses'
import { AdminBudget } from './components/pages/admin/AdminBudget'
import { CreateEvent } from './components/pages/events/CreateEvent'
import { AttendeeEventBrowser } from './components/pages/attendee/AttendeeEventBrowser'
import { AttendeeEventDetail } from './components/pages/attendee/AttendeeEventDetail'
import { AttendeeMyRegistrations } from './components/pages/attendee/AttendeeMyRegistrations'
import { VenueLayout } from './components/layout/VenueLayout'
import { VenueManagerDashboard } from './components/pages/venue/VenueManagerDashboard'
import { Venues } from './components/pages/venue/Venues'
import { VenueBookings } from './components/pages/venue/VenueBookings'
import { VenueResources } from './components/pages/venue/VenueResources'
import BookingVenueAndResource from './components/pages/booking/BookingVenueAndResource'
import { VendorLayout } from './components/layout/VendorLayout'
import { VendorManagerDashboard } from './components/pages/vendor/VendorManagerDashboard'
import { VendorProfile } from './components/pages/vendor/VendorProfile'
import { Contracts } from './components/pages/vendor/Contracts'
import { Deliveries } from './components/pages/vendor/Deliveries'
import { Invoices } from './components/pages/vendor/Invoices'
import { OrganizerContracts } from './components/pages/events/OrganizerContracts'
import { FinanceInvoices } from './components/pages/finance/FinanceInvoices'

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
            { path: '/organizer/contracts',          element: <OrganizerContracts /> },
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
        { path: 'dashboard', element: <FinanceDashboard /> },
        { path: 'expenses', element: <ExpenseApprovals /> },
        { path: 'payments', element: <Payments /> },
        { path: 'budget', element: <BudgetOverview /> },
        { path: 'invoices', element: <FinanceInvoices /> },
      ],
    },
    // ── Admin pages (AppLayout + ADMIN role guard) ─────────────────────────────
    {
      element: <AdminRoute />,
      children: [
        {
          element: <AppLayout />,
          children: [
            { path: '/admin/dashboard',       element: <AdminDashboard /> },
            { path: '/admin/users',           element: <AdminUsers /> },
            { path: '/admin/events',          element: <AdminEvents /> },
            { path: '/admin/events/create',   element: <CreateEvent /> },
            { path: '/admin/events/:id',      element: <EventDetail /> },
            { path: '/admin/events/:id/edit', element: <CreateEvent /> },
            { path: '/admin/expenses',        element: <AdminExpenses /> },
            { path: '/admin/budget',          element: <AdminBudget /> },
            { path: '/admin/audit-logs',      element: <AdminAuditLogs /> },
          ],
        },
      ],
    },

    // ── Venue Manager Portal (separate layout) ─────────────────────────────────
    {

      element: <VenueLayout />,
      children: [
        { path:'/venue-manager/dashboard', element: <VenueManagerDashboard /> },
        { path: '/venue-manager/venues',    element: <Venues /> },
        { path: '/venue-manager/venue/bookings',  element: <VenueBookings /> },
        { path: '/venue-manager/venue/resources', element: <VenueResources /> },
      ],
    },

    // ── Vendor Portal (separate layout) ───────────────────────────────────────
    {
      element: <VendorLayout />,
      children: [
        { path: '/vendor/dashboard',  element: <VendorManagerDashboard /> },
        { path: '/vendor/profile',    element: <VendorProfile /> },
        { path: '/vendor/contracts',  element: <Contracts /> },
        { path: '/vendor/deliveries', element: <Deliveries /> },
        { path: '/vendor/invoices',   element: <Invoices /> },
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
