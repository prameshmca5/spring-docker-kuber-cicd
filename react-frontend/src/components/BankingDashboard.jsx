import React, { useState } from 'react';
import EmployeeDashboard from './EmployeeDashboard';
import CustomerDashboard from './CustomerDashboard';
import AccountDashboard from './AccountDashboard';
import TransactionDashboard from './TransactionDashboard';
import NotificationDashboard from './NotificationDashboard';



const BankingDashboard = () => {
    const [activeTab, setActiveTab] = useState('accounts');
    const renderContent = () => {
        switch (activeTab) {
            case 'employees': return <EmployeeDashboard />;
            case 'customers': return <CustomerDashboard />;
            case 'accounts': return <AccountDashboard />;
            case 'transactions': return <TransactionDashboard />;
            case 'notifications': return <NotificationDashboard />;
            default: return <div className="p-8">Select a microservice module from the navigation above.</div>;
        }
    };

    const tabs = ['employees', 'customers', 'accounts', 'transactions', 'notifications'];

    return (
        <div className="banking-dashboard">
            <header className="dashboard-header">
                <h1>Cloud Banking Platform (Microservices Ecosystem)</h1>
                <div className="tab-menu">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>
            </header>

            <main className="dashboard-content" style={{ padding: '0', background: 'transparent', boxShadow: 'none' }}>
                {renderContent()}
            </main>
        </div>
    );
};

export default BankingDashboard;
