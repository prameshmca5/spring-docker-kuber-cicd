import React, { useEffect, useState } from 'react';
import AccountService from '../services/AccountService';
import AccountForm from './AccountForm';
import { Briefcase, Trash2, DollarSign } from 'lucide-react';

const AccountDashboard = () => {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAccounts = async () => {
        try {
            setLoading(true);
            const response = await AccountService.getAllAccounts();
            setAccounts(response.data);
            setError(null);
        } catch (err) {
            console.error("Error fetching accounts:", err);
            setError("Failed to load account data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAccounts();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to close this account?")) {
            try {
                await AccountService.deleteAccount(id);
                fetchAccounts();
            } catch (err) {
                console.error("Error deleting account:", err);
                alert("Failed to close account.");
            }
        }
    };

    return (
        <div className="dashboard-content-area">
            <header className="top-header">
                <div>
                    <h2>Account Management</h2>
                    <p className="subtitle">Manage bank accounts and balances.</p>
                </div>
            </header>

            <div className="content-grid">
                <section className="form-section">
                    <AccountForm onAccountAdded={fetchAccounts} />
                </section>

                <section className="table-section glass-panel">
                    <div className="table-header">
                        <h3><Briefcase size={20} className="icon-inline" /> Active Accounts ({accounts.length})</h3>
                    </div>

                    {loading ? (
                        <div className="loading-state">
                            <div className="spinner"></div>
                        </div>
                    ) : error ? (
                        <div className="error-banner">{error}</div>
                    ) : accounts.length === 0 ? (
                        <div className="empty-state">
                            <Briefcase size={40} className="empty-icon" />
                            <p>No accounts found.</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="employee-table">
                                <thead>
                                    <tr>
                                        <th>Account ID</th>
                                        <th>Customer ID</th>
                                        <th>Type</th>
                                        <th>Balance</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {accounts.map(acc => (
                                        <tr key={acc.id}>
                                            <td>#{acc.id}</td>
                                            <td>#{acc.customerId}</td>
                                            <td>
                                                <span className="badge">
                                                    {acc.accountType}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="font-semibold text-green-600">
                                                    <DollarSign size={14} className="inline mr-1" />
                                                    {acc.balance.toFixed(2)}
                                                </div>
                                            </td>
                                            <td>
                                                <button onClick={() => handleDelete(acc.id)} className="btn-icon btn-danger" title="Close Account">
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default AccountDashboard;
