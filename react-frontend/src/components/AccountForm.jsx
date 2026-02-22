import React, { useState } from 'react';
import AccountService from '../services/AccountService';
import { Briefcase } from 'lucide-react';

const AccountForm = ({ onAccountAdded }) => {
    const [account, setAccount] = useState({
        customerId: '',
        accountType: 'SAVINGS',
        balance: 0
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setAccount({ ...account, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await AccountService.createAccount({
                ...account,
                customerId: parseInt(account.customerId),
                balance: parseFloat(account.balance)
            });
            setAccount({ customerId: '', accountType: 'SAVINGS', balance: 0 });
            if (onAccountAdded) onAccountAdded();
        } catch (err) {
            console.error("Error creating account:", err);
            setError("Failed to create account. Ensure Customer ID exists.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-container glass-panel">
            <div className="form-header">
                <h3><Briefcase size={20} className="icon-inline" /> Open New Account</h3>
            </div>
            {error && <div className="error-banner">{error}</div>}
            <form onSubmit={handleSubmit} className="custom-form">
                <div className="form-group">
                    <label>Customer ID</label>
                    <input type="number" name="customerId" value={account.customerId} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>Account Type</label>
                    <select name="accountType" value={account.accountType} onChange={handleChange} className="form-control">
                        <option value="SAVINGS">Savings</option>
                        <option value="CHECKING">Checking</option>
                        <option value="BUSINESS">Business</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Initial Balance</label>
                    <input type="number" name="balance" step="0.01" value={account.balance} onChange={handleChange} required />
                </div>
                <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? 'Opening...' : 'Open Account'}
                </button>
            </form>
        </div>
    );
};

export default AccountForm;
