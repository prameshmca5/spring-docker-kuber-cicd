import React, { useState, useContext, useEffect } from 'react';
import {
    CreditCard, Lock, CheckCircle, AlertCircle, Loader,
    Shield, ChevronRight, ArrowLeft
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CARD_TYPES = {
    visa: { label: 'Visa', color: '#1a1f71', logo: '💳', bg: 'linear-gradient(135deg, #1a1f71 0%, #0057b8 100%)' },
    mastercard: { label: 'Mastercard', color: '#eb001b', logo: '💳', bg: 'linear-gradient(135deg, #eb001b 0%, #f79e1b 100%)' },
    amex: { label: 'Amex', color: '#007bc1', logo: '💳', bg: 'linear-gradient(135deg, #007bc1 0%, #00b4d8 100%)' },
};

function detectCardType(number) {
    const n = number.replace(/\s/g, '');
    if (/^4/.test(n)) return 'visa';
    if (/^5[1-5]/.test(n)) return 'mastercard';
    if (/^3[47]/.test(n)) return 'amex';
    return 'visa';
}

function formatCardNumber(value) {
    const digits = value.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(.{4})/g, '$1 ').trim();
}

function formatExpiry(value) {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    if (digits.length > 2) return digits.slice(0, 2) + '/' + digits.slice(2);
    return digits;
}

const PaymentScreen = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [cardType, setCardType] = useState('credit');   // 'credit' | 'debit'
    const [cardBrand, setCardBrand] = useState('visa');
    const [flipped, setFlipped] = useState(false);

    const [form, setForm] = useState({
        cardNumber: '',
        cardHolder: '',
        expiry: '',
        cvv: '',
        amount: '',
        accountId: '',
    });

    const [step, setStep] = useState('form');        // 'form' | 'processing' | 'success' | 'error'
    const [paymentHistory, setPaymentHistory] = useState([]);
    const [errorMsg, setErrorMsg] = useState('');

    const fetchHistory = async (accountId) => {
        try {
            const res = await axios.get(`/api/v1/payments/account/${accountId}`, {
                headers: { Authorization: `Bearer ${user?.token}` }
            });
            setPaymentHistory(res.data || []);
        } catch (err) {
            console.error("Failed to fetch payment history", err);
        }
    };

    useEffect(() => {
        if (user?.userId) {
            fetchHistory(user.userId);
        }
    }, [user]);

    const handleChange = (e) => {
        let { name, value } = e.target;
        if (name === 'cardNumber') {
            value = formatCardNumber(value);
            setCardBrand(detectCardType(value));
        }
        if (name === 'expiry') value = formatExpiry(value);
        if (name === 'cvv') value = value.replace(/\D/g, '').slice(0, 4);
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStep('processing');
        setErrorMsg('');

        try {
            // 1. Submit payment to backend
            const payload = {
                accountId: Number(form.accountId) || user?.userId || 1,
                amount: parseFloat(form.amount),
                status: 'COMPLETED',
            };
            const response = await axios.post('/api/v1/payments', payload, {
                headers: { Authorization: `Bearer ${user?.token}` }
            });

            const payment = response.data;

            // Refresh history
            await fetchHistory(payload.accountId);

            setStep('success');
        } catch (err) {
            setErrorMsg(err?.response?.data?.message || err.message || 'Payment failed. Please try again.');
            setStep('error');
        }
    };

    const card = CARD_TYPES[cardBrand];
    const maskedNumber = form.cardNumber
        ? form.cardNumber.padEnd(19, '•').slice(0, 19)
        : '•••• •••• •••• ••••';

    // ────────────────────────────────────────────
    // PROCESSING SCREEN
    // ────────────────────────────────────────────
    if (step === 'processing') {
        return (
            <div className="d-flex flex-column align-items-center justify-content-center py-5" style={{ minHeight: '60vh' }}>
                <div className="spinner-border text-primary mb-4" style={{ width: '4rem', height: '4rem' }} role="status" />
                <h4 className="fw-bold">Processing Payment...</h4>
                <p className="text-muted">Please wait while we securely process your transaction.</p>
                <div className="d-flex align-items-center text-success mt-3">
                    <Shield size={18} className="me-2" /> Secured with 256-bit encryption
                </div>
            </div>
        );
    }

    // ────────────────────────────────────────────
    // SUCCESS SCREEN
    // ────────────────────────────────────────────
    if (step === 'success') {
        return (
            <div className="row justify-content-center py-4">
                <div className="col-12 col-md-7 col-lg-5">
                    {/* Success Card */}
                    <div className="card border-0 shadow-lg rounded-4 text-center p-5 mb-4">
                        <div className="mb-4">
                            <div className="d-inline-flex align-items-center justify-content-center rounded-circle bg-success bg-opacity-10 mb-3"
                                style={{ width: '90px', height: '90px' }}>
                                <CheckCircle size={52} className="text-success" strokeWidth={1.5} />
                            </div>
                            <h3 className="fw-bold text-success">Payment Successful!</h3>
                            <p className="text-muted">Your {cardType} card payment of</p>
                            <h2 className="fw-bold display-5">${parseFloat(form.amount).toFixed(2)}</h2>
                            <p className="text-muted">was processed successfully.</p>
                        </div>
                        <div className="bg-light rounded-3 p-3 text-start mb-4">
                            <div className="d-flex justify-content-between mb-2">
                                <span className="text-muted small">Card</span>
                                <span className="fw-medium">{card.label} •••• {form.cardNumber.replace(/\s/g, '').slice(-4)}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-2">
                                <span className="text-muted small">Type</span>
                                <span className="fw-medium text-capitalize">{cardType} Card</span>
                            </div>
                            <div className="d-flex justify-content-between">
                                <span className="text-muted small">Date</span>
                                <span className="fw-medium">{new Date().toLocaleString()}</span>
                            </div>
                        </div>
                        <button className="btn btn-primary w-100 py-2 fw-semibold" onClick={() => navigate('/dashboard')}>
                            Return to Dashboard
                        </button>
                    </div>


                </div>
            </div>
        );
    }

    // ────────────────────────────────────────────
    // ERROR SCREEN
    // ────────────────────────────────────────────
    if (step === 'error') {
        return (
            <div className="row justify-content-center py-4">
                <div className="col-12 col-md-6 col-lg-4 text-center">
                    <div className="card border-0 shadow-lg rounded-4 p-5">
                        <div className="d-inline-flex align-items-center justify-content-center rounded-circle bg-danger bg-opacity-10 mb-4 mx-auto"
                            style={{ width: '90px', height: '90px' }}>
                            <AlertCircle size={52} className="text-danger" strokeWidth={1.5} />
                        </div>
                        <h4 className="fw-bold text-danger mb-2">Payment Failed</h4>
                        <p className="text-muted mb-4">{errorMsg}</p>
                        <button className="btn btn-outline-primary w-100" onClick={() => setStep('form')}>
                            <ArrowLeft size={16} className="me-2" /> Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ────────────────────────────────────────────
    // MAIN PAYMENT FORM
    // ────────────────────────────────────────────
    return (
        <div className="row g-4 justify-content-center py-3">

            {/* Left: Card Preview + Form */}
            <div className="col-12 col-lg-7">
                <div className="mb-4">
                    <h4 className="fw-bold mb-1">Make a Payment</h4>
                    <p className="text-muted small">Securely pay using your credit or debit card</p>
                </div>

                {/* Card Type Tabs */}
                <div className="d-flex gap-3 mb-4">
                    {['credit', 'debit'].map(type => (
                        <button key={type} type="button"
                            className={`btn px-4 py-2 fw-semibold text-capitalize rounded-3 ${cardType === type ? 'btn-primary' : 'btn-outline-secondary'}`}
                            onClick={() => setCardType(type)}>
                            {type} Card
                        </button>
                    ))}
                </div>

                {/* Visual Card Preview */}
                <div
                    className="rounded-4 p-4 mb-4 text-white position-relative overflow-hidden"
                    style={{
                        background: card.bg,
                        minHeight: '180px',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
                        cursor: 'pointer',
                    }}
                    onClick={() => setFlipped(!flipped)}
                >
                    <div className="position-absolute top-0 end-0 opacity-25" style={{ fontSize: '160px', lineHeight: 1, userSelect: 'none' }}>◎</div>

                    {!flipped ? (
                        <>
                            <div className="d-flex justify-content-between align-items-start mb-3">
                                <span className="fw-bold fs-5 text-capitalize">{cardType} Card</span>
                                <span className="fw-bold fs-5">{card.label}</span>
                            </div>
                            <div className="mb-3" style={{ letterSpacing: '3px', fontSize: '1.2rem', fontFamily: 'monospace' }}>
                                {maskedNumber}
                            </div>
                            <div className="d-flex justify-content-between align-items-end">
                                <div>
                                    <div className="text-white-50 small" style={{ fontSize: '0.65rem', textTransform: 'uppercase' }}>Card Holder</div>
                                    <div className="fw-semibold">{form.cardHolder || 'YOUR NAME'}</div>
                                </div>
                                <div>
                                    <div className="text-white-50 small" style={{ fontSize: '0.65rem', textTransform: 'uppercase' }}>Expires</div>
                                    <div className="fw-semibold">{form.expiry || 'MM/YY'}</div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="d-flex flex-column justify-content-center h-100">
                            <div className="bg-dark w-100 rounded mb-3" style={{ height: '40px', opacity: 0.7 }}></div>
                            <div className="d-flex align-items-center justify-content-end px-2">
                                <div className="bg-white text-dark rounded px-3 py-1 fw-bold" style={{ letterSpacing: '4px' }}>
                                    {form.cvv ? form.cvv.replace(/./g, '•') : '•••'}
                                </div>
                                <span className="ms-3 text-white-50 small">CVV</span>
                            </div>
                        </div>
                    )}
                    <div className="position-absolute bottom-0 end-0 me-3 mb-2 text-white-50" style={{ fontSize: '0.6rem' }}>
                        Tap to flip
                    </div>
                </div>

                {/* Payment Form */}
                <form onSubmit={handleSubmit} className="card border-0 shadow-sm rounded-4 p-4">
                    <div className="mb-3">
                        <label className="form-label fw-semibold small">Card Number</label>
                        <div className="input-group">
                            <span className="input-group-text bg-light border-end-0"><CreditCard size={16} /></span>
                            <input
                                id="pay-cardNumber"
                                name="cardNumber"
                                type="text"
                                className="form-control border-start-0 ps-0"
                                placeholder="1234 5678 9012 3456"
                                value={form.cardNumber}
                                onChange={handleChange}
                                maxLength={19}
                                required
                            />
                        </div>
                    </div>

                    <div className="mb-3">
                        <label className="form-label fw-semibold small">Card Holder Name</label>
                        <input id="pay-cardHolder" name="cardHolder" type="text" className="form-control"
                            placeholder="John Doe"
                            value={form.cardHolder} onChange={handleChange} required />
                    </div>

                    <div className="row mb-3">
                        <div className="col-6">
                            <label className="form-label fw-semibold small">Expiry Date</label>
                            <input id="pay-expiry" name="expiry" type="text" className="form-control"
                                placeholder="MM/YY"
                                value={form.expiry} onChange={handleChange} maxLength={5} required />
                        </div>
                        <div className="col-6">
                            <label className="form-label fw-semibold small">CVV</label>
                            <div className="input-group">
                                <input id="pay-cvv" name="cvv" type="password" className="form-control"
                                    placeholder="•••"
                                    value={form.cvv} onChange={handleChange}
                                    onFocus={() => setFlipped(true)}
                                    onBlur={() => setFlipped(false)}
                                    maxLength={4} required />
                                <span className="input-group-text bg-light"><Lock size={14} /></span>
                            </div>
                        </div>
                    </div>

                    <div className="row mb-4">
                        <div className="col-6">
                            <label className="form-label fw-semibold small">Amount ($)</label>
                            <input id="pay-amount" name="amount" type="number" className="form-control"
                                placeholder="0.00" step="0.01" min="0.01"
                                value={form.amount} onChange={handleChange} required />
                        </div>
                        <div className="col-6">
                            <label className="form-label fw-semibold small">Account ID</label>
                            <input id="pay-accountId" name="accountId" type="number" className="form-control"
                                placeholder={user?.userId || '1'}
                                value={form.accountId} onChange={handleChange} />
                        </div>
                    </div>

                    <button id="pay-submit" type="submit" className="btn btn-primary w-100 py-3 fw-bold rounded-3 d-flex align-items-center justify-content-center gap-2">
                        <Shield size={18} />
                        Pay ${form.amount ? parseFloat(form.amount).toFixed(2) : '0.00'} Securely
                        <ChevronRight size={18} />
                    </button>

                    <p className="text-center text-muted mt-3 mb-0 small">
                        <Lock size={12} className="me-1" />
                        Protected by 256-bit SSL encryption · PCI DSS Compliant
                    </p>
                </form>
            </div>

            {/* Right: Summary Panel */}
            <div className="col-12 col-lg-4">
                <div className="card border-0 shadow-sm rounded-4 p-4 mb-3">
                    <h6 className="fw-bold mb-3">Payment Summary</h6>
                    <div className="d-flex justify-content-between mb-2 text-muted small">
                        <span>Card Type</span>
                        <span className="text-dark fw-semibold text-capitalize">{cardType}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2 text-muted small">
                        <span>Network</span>
                        <span className="text-dark fw-semibold">{card.label}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2 text-muted small">
                        <span>Processing Fee</span>
                        <span className="text-success fw-semibold">Free</span>
                    </div>
                    <hr />
                    <div className="d-flex justify-content-between fw-bold">
                        <span>Total</span>
                        <span className="text-primary fs-5">${form.amount ? parseFloat(form.amount).toFixed(2) : '0.00'}</span>
                    </div>
                </div>
            </div>

            {/* Payment History */}
            <div className="col-12 mt-2">
                <div className="card border-0 shadow-sm rounded-4 p-4">
                    <h5 className="fw-bold mb-4">Payment History</h5>
                    {paymentHistory.length === 0 ? (
                        <p className="text-muted mb-0">No past payments found for your account.</p>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead>
                                    <tr>
                                        <th className="text-muted small fw-semibold border-0">Reference ID</th>
                                        <th className="text-muted small fw-semibold border-0">Amount</th>
                                        <th className="text-muted small fw-semibold border-0 text-end">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paymentHistory.slice().reverse().map(payment => (
                                        <tr key={payment.id}>
                                            <td>
                                                <span className="fw-medium text-dark">#{payment.id}</span>
                                            </td>
                                            <td className="fw-bold text-dark">
                                                ${parseFloat(payment.amount).toFixed(2)}
                                            </td>
                                            <td className="text-end">
                                                <span className={`badge ${payment.status === 'COMPLETED' ? 'bg-success bg-opacity-10 text-success' : 'bg-warning bg-opacity-10 text-warning'} px-3 py-2 rounded-pill fw-semibold`}>
                                                    {payment.status || 'COMPLETED'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div >
    );
};

export default PaymentScreen;
