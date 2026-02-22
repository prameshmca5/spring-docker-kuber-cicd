import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import BankingDashboard from './components/BankingDashboard';
import EmployeeDashboard from './components/EmployeeDashboard';
import LandingPage from './components/LandingPage';
import AccountsCards from './components/AccountsCards';
import Transfers from './components/Transfers';
import Settings from './components/Settings';
import Login from './components/Login';
import Register from './components/Register';
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
              <Route index element={<EmployeeDashboard />} />
              <Route path="accounts" element={<AccountsCards />} />
              <Route path="transfers" element={<Transfers />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
