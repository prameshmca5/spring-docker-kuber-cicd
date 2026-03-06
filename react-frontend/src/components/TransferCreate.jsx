import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRightLeft, Send } from 'lucide-react';
import TransactionService from '../services/TransactionService';
import AccountService from '../services/AccountService';
import { AuthContext } from '../context/AuthContext';

const TransferCreate = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [accounts, setAccounts] = useState([]);
    const [loadingAccounts, setLoadingAccounts] = useState(true);

    const [transfer, setTransfer] = useState({
        accountId: '',
        amount: '',
        type: 'Transfer'
    });

    const [status, setStatus] = useState({ loading: false, error: null, success: false });

    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                const customerId = user?.userId || 1;
                const response = await AccountService.getAccountsByCustomerId(customerId);
                setAccounts(response.data);
                if (response.data.length > 0) {
                    setTransfer(prev => ({ ...prev, accountId: response.data[0].id }));
                }
            } catch (err) {
                console.error("Failed to fetch accounts:", err);
            } finally {
                setLoadingAccounts(false);
            }
        };
        fetchAccounts();
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!transfer.accountId || !transfer.amount || parseFloat(transfer.amount) <= 0) {
            setStatus({ loading: false, error: 'Please submit a valid account and amount.', success: false });
            return;
        }

        setStatus({ loading: true, error: null, success: false });

        try {
            await TransactionService.createTransaction({
                accountId: transfer.accountId,
                amount: parseFloat(transfer.amount),
                type: transfer.type
            });

            setStatus({ loading: false, error: null, success: true });

            setTimeout(() => {
                navigate('/dashboard/transfers/list');
            }, 1500);

        } catch (error) {
            console.error('Failed to create transfer:', error);
            setStatus({ loading: false, error: 'Transaction failed. Please try again.', success: false });
        }
    };

    return (
        <div className="card shadow-sm border-0">
            <div className="card-header bg-white pt-4 pb-3 border-bottom-0">
                <h3 className="card-title text-primary fw-bold mb-0 d-flex align-items-center">
                    <ArrowRightLeft className="me-3" size={28} />
                    New Transfer
                </h3>
            </div>
            <div className="card-body p-4">
                {status.success && (
                    <div className="alert alert-success fw-bold">
                        Transfer successful! Wait while we redirect...
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
                                    <label className="form-label fw-bold text-dark">Source Account</label>
                                    <select
                                        className="form-select form-select-lg"
                                        value={transfer.accountId}
                                        onChange={(e) => setTransfer({ ...transfer, accountId: e.target.value })}
                                        disabled={loadingAccounts || accounts.length === 0}
                                        required
                                    >
                                        {loadingAccounts ? (
                                            <option>Loading accounts...</option>
                                        ) : accounts.length === 0 ? (
                                            <option>No accounts available</option>
                                        ) : (
                                            accounts.map(acc => (
                                                <option key={acc.id} value={acc.id}>
                                                    {acc.accountType} (**** {String(acc.id).padStart(4, '0')}) - ${parseFloat(acc.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                                </option>
                                            ))
                                        )}
                                    </select>
                                    {accounts.length === 0 && !loadingAccounts && (
                                        <div className="form-text text-danger">You must create an account first.</div>
                                    )}
                                </div>

                                <div className="mb-4 text-center">
                                    <div className="bg-white p-2 d-inline-block rounded-circle shadow-sm border text-primary">
                                        <ArrowRightLeft size={24} />
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="form-label fw-bold text-dark">Destination Details</label>
                                    <input type="text" className="form-control form-control-lg" placeholder="Recipient Account Name or Email (Optional for internal demo)" />
                                    <div className="form-text text-muted">Currently processes as internal debit transaction</div>
                                </div>

                                <div className="mb-4">
                                    <label className="form-label fw-bold text-dark">Amount</label>
                                    <div className="input-group input-group-lg">
                                        <span className="input-group-text bg-white fw-bold">$</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            className="form-control"
                                            placeholder="0.00"
                                            value={transfer.amount}
                                            onChange={(e) => setTransfer({ ...transfer, amount: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="d-grid gap-2 mt-5">
                                    <button
                                        type="submit"
                                        className="btn btn-primary btn-lg fw-bold d-flex align-items-center justify-content-center py-3"
                                        disabled={status.loading || accounts.length === 0}
                                    >
                                        <Send size={20} className="me-2" />
                                        {status.loading ? 'Processing...' : 'Send Money'}
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

export default TransferCreate;
