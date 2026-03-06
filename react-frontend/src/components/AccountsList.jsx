import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, PlusCircle, ShieldCheck, RefreshCw } from 'lucide-react';
import AccountService from '../services/AccountService';
import { AuthContext } from '../context/AuthContext';

const AccountsList = () => {
    const { user } = useContext(AuthContext);
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAccounts = async () => {
        setLoading(true);
        setError(null);
        try {
            const customerId = user?.userId || 1; // Fallback
            const response = await AccountService.getAccountsByCustomerId(customerId);
            setAccounts(response.data);
        } catch (err) {
            console.error('Error fetching accounts:', err);
            setError('Failed to load accounts. Ensure the backend is running.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAccounts();
    }, [user]);

    const getCardStyle = (type) => {
        if (type?.toLowerCase().includes('savings')) return { bg: 'bg-success', icon: <ShieldCheck size={120} /> };
        if (type?.toLowerCase().includes('business')) return { bg: 'bg-dark', icon: <CreditCard size={120} /> };
        return { bg: 'bg-primary', icon: <ShieldCheck size={120} /> };
    };

    return (
        <div className="card shadow-sm border-0">
            <div className="card-header bg-white pt-4 pb-3 border-bottom-0 d-flex justify-content-between align-items-center">
                <h3 className="card-title text-primary fw-bold mb-0 d-flex align-items-center">
                    <CreditCard className="me-3" size={28} />
                    My Accounts
                </h3>
                <button className="btn btn-outline-secondary btn-sm" onClick={fetchAccounts} disabled={loading}>
                    <RefreshCw size={16} className={loading ? "spin" : ""} /> Refresh
                </button>
            </div>

            <div className="card-body p-4">
                {error && <div className="alert alert-danger">{error}</div>}

                {loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                ) : accounts.length === 0 ? (
                    <div className="text-center py-5 bg-light rounded-4 border">
                        <CreditCard size={48} className="text-muted mb-3 opacity-50" />
                        <h5 className="fw-bold">No accounts found</h5>
                        <p className="text-muted">You don't have any accounts opened yet.</p>
                        <Link to="/dashboard/accounts/create" className="btn btn-primary mt-2">
                            Open Your First Account
                        </Link>
                    </div>
                ) : (
                    <div className="row g-4">
                        {accounts.map(account => {
                            const style = getCardStyle(account.accountType);
                            return (
                                <div className="col-md-6" key={account.id}>
                                    <div className={`p-4 ${style.bg} text-white rounded-4 shadow position-relative overflow-hidden h-100`}>
                                        <div className="position-absolute top-0 end-0 opacity-10 p-3">
                                            {style.icon}
                                        </div>
                                        <h5 className="mb-1 text-white-50 fw-semibold">{account.accountType}</h5>
                                        <h2 className="display-6 fw-bold mb-4">
                                            ${parseFloat(account.balance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </h2>
                                        <div className="d-flex justify-content-between align-items-end mt-4">
                                            <div>
                                                <p className="mb-0 text-white-50 small">Account Number</p>
                                                <p className="mb-0 fw-medium">**** **** **** {String(account.id).padStart(4, '0')}</p>
                                            </div>
                                            <div className="bg-white bg-opacity-25 px-3 py-1 rounded-pill small fw-medium">
                                                Active
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                <div className="mt-5 text-center">
                    <Link to="/dashboard/accounts/create" className="btn btn-outline-primary fw-bold px-4 py-2 rounded-pill d-inline-flex align-items-center">
                        <PlusCircle size={18} className="me-2" /> Open A New Account
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AccountsList;
