import React from 'react';
import EmployeeDashboard from './EmployeeDashboard';

const BankingDashboard = () => {
    return (
        <div className="banking-dashboard">
            <header className="dashboard-header">
                <h1>Cloud Banking Platform (Microservices Ecosystem)</h1>
            </header>

            <main className="dashboard-content" style={{ padding: '0', background: 'transparent', boxShadow: 'none' }}>
                <EmployeeDashboard />
            </main>
        </div>
    );
};

export default BankingDashboard;
