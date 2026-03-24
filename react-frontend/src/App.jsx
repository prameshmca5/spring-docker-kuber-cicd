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
import BankingSectionPage from './components/BankingSectionPage';
import BankingWorkspacePage from './components/BankingWorkspacePage';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { CUSTOMER_MENU_SECTIONS } from './config/bankingMenu';
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
              {CUSTOMER_MENU_SECTIONS.map((section) => (
                <Route key={section.id} path={section.slug}>
                  <Route index element={<BankingSectionPage sectionId={section.id} />} />
                  {section.items.map((item) => {
                    if (section.id === 'payments' && item.id === 'credit-card-payment') {
                      return <Route key={item.id} path={item.slug} element={<PaymentScreen />} />;
                    }

                    if (section.id === 'loans' && item.id === 'summary') {
                      return <Route key={item.id} path={item.slug} element={<LoansCenter />} />;
                    }

                    return (
                      <Route
                        key={item.id}
                        path={item.slug}
                        element={<BankingWorkspacePage sectionId={section.id} itemId={item.id} />}
                      />
                    );
                  })}
                </Route>
              ))}
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
              <Route path="employees" element={<EmployeeDashboard />} />
              <Route path="notifications" element={<NotificationsCenter />} />
              <Route path="reports" element={<ReportsCenter />} />
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
