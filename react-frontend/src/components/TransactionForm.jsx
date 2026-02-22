import React, { useState } from 'react';
import TransactionService from '../services/TransactionService';
import { ArrowLeftRight } from 'lucide-react';

const TransactionForm = ({ onTransactionAdded }) => {
    const [transaction, setTransaction] = useState({
        accountId: '',
        amount: 0,
        type: 'DEPOSIT'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setTransaction({ ...transaction, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (transaction.amount <= 0) {
            setError("Amount must be greater than zero.");
            return;
        }
        setLoading(true);
        setError(null);
        try {
            await TransactionService.createTransaction({
                ...transaction,
                accountId: parseInt(transaction.accountId),
                amount: parseFloat(transaction.amount)
            });
            setTransaction({ accountId: '', amount: 0, type: 'DEPOSIT' });
            if (onTransactionAdded) onTransactionAdded();
        } catch (err) {
            console.error("Error processing transaction:", err);
            setError("Failed to process transaction. Check Account ID and Balance.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-container glass-panel">
            <div className="form-header">
                <h3><ArrowLeftRight size={20} className="icon-inline" /> New Transaction</h3>
            </div>
            {error && <div className="error-banner">{error}</div>}
            <form onSubmit={handleSubmit} className="custom-form">
                <div className="form-group">
                    <label>Account ID</label>
                    <input type="number" name="accountId" value={transaction.accountId} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>Transaction Type</label>
                    <select name="type" value={transaction.type} onChange={handleChange} className="form-control">
                        <option value="DEPOSIT">Deposit</option>
                        <option value="WITHDRAWAL">Withdrawal</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Amount</label>
                    <input type="number" name="amount" step="0.01" value={transaction.amount} onChange={handleChange} required />
                </div>
                <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? 'Processing...' : 'Process Transaction'}
                </button>
            </form>
        </div>
    );
};

export default TransactionForm;
