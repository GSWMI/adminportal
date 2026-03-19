import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'

// import ProtectedRoute from './components/ProtectedRoute'
import DashboardLayout from './components/layout/DashboardLayout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import TicketsPage from './pages/TicketsPage'
import NewTicketPage from './pages/tickets/NewTicketPage'
import TicketPreviewPage from './pages/tickets/TicketPreviewPage'
import TicketDetailPage from './pages/tickets/detail/TicketDetailPage'
import AttendeesPage from './pages/tickets/detail/AttendeesPage'
import MealTicketsPage from './pages/tickets/detail/MealTicketsPage'
import TransactionsPage from './pages/TransactionsPage'
import TransactionDetailPage from './pages/transactions/TransactionDetailPage'
import UsersPage from './pages/UsersPage'

export default function App() {
  return (
    <>
      <Toaster position="top-right" richColors />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          {/* Ticket preview — full page outside admin layout */}
          <Route path="/tickets/preview" element={
       //     <ProtectedRoute>
              <TicketPreviewPage />
          //     </ProtectedRoute>
            } />

          <Route path="/" element={
          //     <ProtectedRoute>
              <DashboardLayout />
         //      </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="tickets" element={<TicketsPage />} />
            <Route path="tickets/new" element={<NewTicketPage />} />
            <Route path="tickets/:id" element={<TicketDetailPage />} />
            <Route path="tickets/:id/attendees" element={<AttendeesPage />} />
            <Route path="tickets/:id/meal-tickets" element={<MealTicketsPage />} />
            <Route path="transactions" element={<TransactionsPage />} />
            <Route path="transactions/:id" element={<TransactionDetailPage />} />
            <Route path="users" element={<UsersPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}