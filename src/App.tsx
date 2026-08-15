import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import ProtectedRoute from './components/ProtectedRoute'
import DashboardLayout from './components/layout/DashboardLayout'
import LoginPage from './pages/LoginPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import SetPasswordPage from './pages/auth/SetPasswordPage'
import SettingsPage from './pages/SettingsPage'
import ContributionsPage from './pages/ContributionsPage'
import SponsorshipDetailPage from './pages/contributions/SponsorshipDetailPage'
import DonationDetailPage from './pages/contributions/DonationDetailPage'
import DashboardPage from './pages/DashboardPage'
import TicketsPage from './pages/TicketsPage'
import NewTicketPage from './pages/tickets/NewTicketPage'
import TicketPreviewPage from './pages/tickets/TicketPreviewPage'
import PublicEventPage from './pages/tickets/PublicEventPage'
import TicketDetailPage from './pages/tickets/detail/TicketDetailPage'
import AttendeesPage from './pages/tickets/detail/AttendeesPage'
import MealTicketsPage from './pages/tickets/detail/MealTicketsPage'
import AccommodationTicketsPage from './pages/tickets/detail/AccommodationTicketsPage'
import TransportTicketsPage from './pages/tickets/detail/TransportTicketsPage'
import TransactionsPage from './pages/TransactionsPage'
import TransactionDetailPage from './pages/transactions/TransactionDetailPage'
import UsersPage from './pages/UsersPage'
import AttendeeDetailPage from './pages/tickets/detail/AttendeeDetailPage'

export default function App() {
  return (
    <>
      <Toaster position="top-right" richColors />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          {/* Unified set-password page. /reset-password kept as an alias so any older
              reset links still resolve; the backend now links both to /set-password. */}
          <Route path="/set-password" element={<SetPasswordPage />} />
          <Route path="/reset-password" element={<SetPasswordPage />} />
          <Route path="/tickets/preview" element={<ProtectedRoute><TicketPreviewPage /></ProtectedRoute>} />
          <Route path="/events/s/:slug" element={<PublicEventPage />} />

          <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="tickets" element={<TicketsPage />} />
            <Route path="tickets/new" element={<NewTicketPage />} />
            <Route path="tickets/:id" element={<TicketDetailPage />} />
            <Route path="tickets/:id/attendees" element={<AttendeesPage />} />
            <Route path="/tickets/:id/attendees/:orderNumber" element={<AttendeeDetailPage />} />
            <Route path="tickets/:id/meal-tickets" element={<MealTicketsPage />} />
            <Route path="tickets/:id/accommodation-tickets" element={<AccommodationTicketsPage />} />
            <Route path="tickets/:id/transport-tickets" element={<TransportTicketsPage />} />
            <Route path="transactions" element={<TransactionsPage />} />
            <Route path="transactions/:id" element={<TransactionDetailPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="contributions" element={<ContributionsPage />} />
            <Route path="contributions/sponsorship/:id" element={<SponsorshipDetailPage />} />
            <Route path="contributions/donation/:id" element={<DonationDetailPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}