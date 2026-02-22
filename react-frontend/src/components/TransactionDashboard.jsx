import React, { useEffect, useState } from 'react';
import TransactionService from '../services/TransactionService';
import TransactionForm from './TransactionForm';
import { ArrowLeftRight, Trash2, Calendar } from 'lucide-react';

const TransactionDashboard = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const response = await TransactionService.getAllTransactions();
            setTransactions(response.data);
            setError(null);
        } catch (err) {
            console.error("Error fetching transactions:", err);
            setError("Failed to load transaction data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this transaction record?")) {
            try {
                await TransactionService.deleteTransaction(id);
                fetchTransactions();
            } catch (err) {
                console.error("Error deleting transaction:", err);
                alert("Failed to delete transaction.");
            }
        }
    };

    return (
        <div className="dashboard-content-area">
            <header className="top-header">
                <div>
                    <h2>Transaction Log</h2>
                    <p className="subtitle">Process deposits and withdrawals.</p>
                </div>
            </header>

            <div className="content-grid">
                <section className="form-section">
                    <TransactionForm onTransactionAdded={fetchTransactions} />
                </section>

                <section className="table-section glass-panel">
                    <div className="table-header">
                        <h3><ArrowLeftRight size={20} className="icon-inline" /> Recent Transactions ({transactions.length})</h3>
                    </div>

                    {loading ? (
                        <div className="loading-state">
                            <div className="spinner"></div>
                        </div>
                    ) : error ? (
                        <div className="error-banner">{error}</div>
                    ) : transactions.length === 0 ? (
                        <div className="empty-state">
                            <ArrowLeftRight size={40} className="empty-icon" />
                            <p>No transactions found.</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="employee-table">
                                <thead>
                                    <tr>
                                        <th>Txn ID</th>
                                        <th>Account ID</th>
                                        <th>Type</th>
                                        <th>Amount</th>
                                        <th>Timestamp</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.map(txn => (
                                        <tr key={txn.id}>
                                            <td>#{txn.id}</td>
                                            <td>#{txn.accountId}</td>
                                            <td>
                                                <span className={`badge ${txn.type === 'DEPOSIT' ? 'department-badge' : 'bg-orange-100 text-orange-800'}`}>
                                                    {txn.type}
                                                </span>
                                            </td>
                                            <td className={`font-semibold ${txn.type === 'DEPOSIT' ? 'text-green-600' : 'text-red-500'}`}>
                                                {txn.type === 'DEPOSIT' ? '+' : '-'}{txn.amount.toFixed(2)}
                                            </td>
                                            <td>
                                                <div className="contact-info">
                                                    <Calendar size={14} /> {new Date(txn.timestamp).toLocaleString()}
                                                </div>
                                            </td>
                                            <td>
                                                <button onClick={() => handleDelete(txn.id)} className="btn-icon btn-danger" title="Delete Record">
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

export default TransactionDashboard;
