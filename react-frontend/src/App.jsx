import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import BankingDashboard from './components/BankingDashboard';
import EmployeeDashboard from './components/EmployeeDashboard';
import LandingPage from './components/LandingPage';
import DashboardHome from './components/DashboardHome';
import AccountsCards from './components/AccountsCards';
import Transfers from './components/Transfers';
import AccountCreate from './components/AccountCreate';
import AccountsList from './components/AccountsList';
import TransferCreate from './components/TransferCreate';
import TransfersList from './components/TransfersList';
import Settings from './components/Settings';
import Login from './components/Login';
import Register from './components/Register';
import PaymentScreen from './components/PaymentScreen';
import KafkaSample from './components/KafkaSample';
import NotificationsCenter from './components/NotificationsCenter';
import ReportsCenter from './components/ReportsCenter';
import LoansCenter from './components/LoansCenter';
import AuditCenter from './components/AuditCenter';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/dashboard" element={<ProtectedRoute />}>
            <Route element={<BankingDashboard />}>
              <Route index element={<DashboardHome />} />
              <Route path="accounts">
                <Route index element={<AccountsCards />} />
                <Route path="list" element={<AccountsList />} />
                <Route path="create" element={<AccountCreate />} />
              </Route>
              <Route path="transfers">
                <Route index element={<Transfers />} />
                <Route path="list" element={<TransfersList />} />
                <Route path="create" element={<TransferCreate />} />
              </Route>
              <Route path="payments" element={<PaymentScreen />} />
              <Route path="employees" element={<EmployeeDashboard />} />
              <Route path="notifications" element={<NotificationsCenter />} />
              <Route path="reports" element={<ReportsCenter />} />
              <Route path="loans" element={<LoansCenter />} />
              <Route path="audit" element={<AuditCenter />} />
              <Route path="kafka-sample" element={<KafkaSample />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
