import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, PlusCircle } from 'lucide-react';
import AccountService from '../services/AccountService';
import { AuthContext } from '../context/AuthContext';

const AccountCreate = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [account, setAccount] = useState({
        accountType: 'Premium Checking',
        balance: 0.0
    });

    const [status, setStatus] = useState({ loading: false, error: null, success: false });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ loading: true, error: null, success: false });

        try {
            const customerId = user?.userId || 1; // Fallback to 1 if no logged-in user id
            const payload = {
                customerId: customerId,
                accountType: account.accountType,
                balance: parseFloat(account.balance)
            };

            await AccountService.createAccount(payload);
            setStatus({ loading: false, error: null, success: true });

            // Redirect after brief delay
            setTimeout(() => {
                navigate('/dashboard/accounts/list');
            }, 1500);

        } catch (error) {
            console.error('Failed to create account:', error);
            setStatus({
                loading: false,
                error: 'Failed to create account. Please try again.',
                success: false
            });
        }
    };

    return (
        <div className="card shadow-sm border-0">
            <div className="card-header bg-white pt-4 pb-3 border-bottom-0">
                <h3 className="card-title text-primary fw-bold mb-0 d-flex align-items-center">
                    <ShieldCheck className="me-3" size={28} />
                    Open New Account
                </h3>
            </div>

            <div className="card-body p-4">
                {status.success && (
                    <div className="alert alert-success fw-bold">
                        Account successfully created! Navigating to your accounts...
                    </div>
                )}

                {status.error && (
                    <div className="alert alert-danger fw-bold">
                        {status.error}
                    </div>
                )}

                <div className="row justify-content-center">
                    <div className="col-lg-8">
                        <div className="p-4 bg-light rounded-4 border">
                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <label className="form-label fw-bold text-dark">Account Type</label>
                                    <select
                                        className="form-select form-select-lg"
                                        value={account.accountType}
                                        onChange={(e) => setAccount({ ...account, accountType: e.target.value })}
                                    >
                                        <option value="Premium Checking">Premium Checking</option>
                                        <option value="High Yield Savings">High Yield Savings</option>
                                        <option value="Standard Checking">Standard Checking</option>
                                        <option value="Business Account">Business Account</option>
                                    </select>
                                </div>

                                <div className="mb-4">
                                    <label className="form-label fw-bold text-dark">Initial Deposit ($)</label>
                                    <div className="input-group input-group-lg">
                                        <span className="input-group-text bg-white fw-bold">$</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            className="form-control"
                                            placeholder="0.00"
                                            value={account.balance}
                                            onChange={(e) => setAccount({ ...account, balance: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-text mt-2 text-muted">
                                        Note: A real banking app would require a funding source here.
                                    </div>
                                </div>

                                <div className="d-grid gap-2 mt-5">
                                    <button
                                        type="submit"
                                        className="btn btn-primary btn-lg fw-bold d-flex align-items-center justify-content-center py-3"
                                        disabled={status.loading}
                                    >
                                        <PlusCircle size={20} className="me-2" />
                                        {status.loading ? 'Creating...' : 'Open Account'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccountCreate;
