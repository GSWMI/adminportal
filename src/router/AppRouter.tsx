import { BrowserRouter, Route, Routes } from "react-router-dom";
import DashboardPage from "../pages/DashboardPage";
import LoginPage from "../pages/LoginPage";
import TicketsPage from "../pages/TicketsPage";
import TransactionsPage from "../pages/TransactionsPage";
import UsersPage from "../pages/UsersPage";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* <Route path="/" element={<Navigate to="/login" replace />} /> */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage showFilledState />} />
        <Route
  path="/dashboard-empty"
  element={<DashboardPage showFilledState={false} />}
/>
       <Route path="/tickets" element={<TicketsPage showFilledState />} />
        <Route
          path="/tickets-empty"
          element={<TicketsPage showFilledState={false} />}
        />
        <Route path="/transactions" element={<TransactionsPage showFilledState />} />
        <Route
          path="/transactions-empty"
          element={<TransactionsPage showFilledState={false} />}
        />
        <Route path="/users" element={<UsersPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;