import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftRight, Clock, PlusCircle, ArrowUpRight, RefreshCw, Send } from 'lucide-react';
import TransactionService from '../services/TransactionService';
import AccountService from '../services/AccountService';
import { AuthContext } from '../context/AuthContext';

const TransfersList = () => {
    const { user } = useContext(AuthContext);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const customerId = user?.userId || 1;

            // First fetch accounts to get their IDs
            const accountsResp = await AccountService.getAccountsByCustomerId(customerId);
            const accountIds = accountsResp.data.map(acc => acc.id);

            // Fetch transactions for all account IDs
            let allTransactions = [];
            for (const accId of accountIds) {
                const txResp = await TransactionService.getTransactionsByAccountId(accId);
                allTransactions = [...allTransactions, ...txResp.data];
            }

            // Sort by latest
            allTransactions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            setTransactions(allTransactions);

        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Failed to load transfers. Ensure backend services are running.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user]);

    return (
        <div className="card shadow-sm border-0">
            <div className="card-header bg-white pt-4 pb-3 border-bottom-0 d-flex justify-content-between align-items-center">
                <h3 className="card-title text-primary fw-bold mb-0 d-flex align-items-center">
                    <Clock className="me-3" size={28} />
                    Transfer History
                </h3>
                <button className="btn btn-outline-secondary btn-sm" onClick={fetchData} disabled={loading}>
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
                ) : transactions.length === 0 ? (
                    <div className="text-center py-5 bg-light rounded-4 border">
                        <ArrowLeftRight size={48} className="text-muted mb-3 opacity-50" />
                        <h5 className="fw-bold">No transfers found</h5>
                        <p className="text-muted">You haven't made any transactions yet.</p>
                        <Link to="/dashboard/transfers/create" className="btn btn-primary mt-2">
                            Make a Transfer
                        </Link>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-hover align-middle">
                            <thead className="table-light text-muted">
                                <tr>
                                    <th className="fw-semibold">Date</th>
                                    <th className="fw-semibold">Description</th>
                                    <th className="fw-semibold">Account ID</th>
                                    <th className="fw-semibold text-end">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map((tx) => (
                                    <tr key={tx.id}>
                                        <td>
                                            <div className="fw-medium">
                                                {new Date(tx.timestamp).toLocaleDateString()}
                                            </div>
                                            <small className="text-muted">
                                                {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </small>
                                        </td>
                                        <td>
                                            <div className="d-flex align-items-center">
                                                <div className="bg-light p-2 rounded-circle me-3 text-secondary">
                                                    <Send size={18} />
                                                </div>
                                                <div>
                                                    <span className="fw-bold text-dark d-block">Outgoing Transfer</span>
                                                    <small className="text-muted">Ref: TXN-{String(tx.id).padStart(6, '0')}</small>
                                                </div>
                                            </div>
                                        </td>
                                        <td>**** {String(tx.accountId).padStart(4, '0')}</td>
                                        <td className="text-end fw-bold text-danger">
                                            -${parseFloat(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="mt-4 pt-3 border-top text-center">
                    <Link to="/dashboard/transfers/create" className="btn btn-primary fw-bold px-4 py-2 rounded-pill d-inline-flex align-items-center">
                        <PlusCircle size={18} className="me-2" /> Make New Transfer
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default TransfersList;
