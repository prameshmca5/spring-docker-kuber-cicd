import React, { useMemo, useState } from 'react';
import { Check, Filter, Landmark, Plus, X } from 'lucide-react';

const STORAGE_KEY = 'bank_loan_requests';

function loadLoans() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) {
            return [];
        }
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function saveLoans(items) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

const INITIAL_FORM = {
    customerName: '',
    amount: '',
    tenureMonths: '',
    purpose: '',
};

const LoansCenter = () => {
    const [form, setForm] = useState(INITIAL_FORM);
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [loans, setLoans] = useState(loadLoans);

    const onChange = (event) => {
        const { name, value } = event.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const createLoan = (event) => {
        event.preventDefault();

        const payload = {
            id: Date.now(),
            customerName: form.customerName.trim(),
            amount: Number(form.amount),
            tenureMonths: Number(form.tenureMonths),
            purpose: form.purpose.trim(),
            status: 'PENDING',
            createdAt: new Date().toISOString(),
        };

        const updated = [payload, ...loans];
        setLoans(updated);
        saveLoans(updated);
        setForm(INITIAL_FORM);
    };

    const updateStatus = (id, status) => {
        const updated = loans.map((loan) =>
            loan.id === id
                ? { ...loan, status, updatedAt: new Date().toISOString() }
                : loan
        );
        setLoans(updated);
        saveLoans(updated);
    };

    const filteredLoans = useMemo(() => {
        if (statusFilter === 'ALL') {
            return loans;
        }
        return loans.filter((loan) => loan.status === statusFilter);
    }, [loans, statusFilter]);

    return (
        <section className="content-card">
            <header className="section-head">
                <h2>Loan Requests</h2>
                <p>Create, approve, reject, and track loan applications from one screen.</p>
            </header>

            <div className="loan-grid mt-3">
                <form className="loan-form" onSubmit={createLoan}>
                    <h3>Create Request</h3>

                    <label className="field-label">Customer Name</label>
                    <input
                        name="customerName"
                        value={form.customerName}
                        onChange={onChange}
                        placeholder="Enter customer name"
                        required
                    />

                    <label className="field-label">Amount</label>
                    <input
                        name="amount"
                        type="number"
                        min="1"
                        step="0.01"
                        value={form.amount}
                        onChange={onChange}
                        placeholder="25000"
                        required
                    />

                    <label className="field-label">Tenure (Months)</label>
                    <input
                        name="tenureMonths"
                        type="number"
                        min="1"
                        value={form.tenureMonths}
                        onChange={onChange}
                        placeholder="36"
                        required
                    />

                    <label className="field-label">Purpose</label>
                    <textarea
                        name="purpose"
                        value={form.purpose}
                        onChange={onChange}
                        placeholder="Home loan, business expansion, education..."
                        rows={4}
                        required
                    />

                    <button type="submit" className="primary-btn mt-2">
                        <Plus size={16} />
                        <span>Create Loan Request</span>
                    </button>
                </form>

                <div>
                    <div className="d-flex align-items-center justify-content-between mb-2">
                        <h3 className="mb-0" style={{ fontSize: '1rem' }}>Request Queue</h3>
                        <div className="d-flex align-items-center gap-2">
                            <Filter size={16} />
                            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                                <option value="ALL">All</option>
                                <option value="PENDING">Pending</option>
                                <option value="APPROVED">Approved</option>
                                <option value="REJECTED">Rejected</option>
                            </select>
                        </div>
                    </div>

                    {filteredLoans.length === 0 && (
                        <div className="empty-state">
                            <Landmark size={20} />
                            <p>No loan requests found for the selected filter.</p>
                        </div>
                    )}

                    {filteredLoans.length > 0 && (
                        <div className="list-stack">
                            {filteredLoans.map((loan) => (
                                <article key={loan.id} className="list-item loan-item">
                                    <div>
                                        <h3>{loan.customerName}</h3>
                                        <p className="mb-1">{loan.purpose}</p>
                                        <span className="muted-line small d-block">
                                            ${loan.amount.toLocaleString()} | {loan.tenureMonths} months
                                        </span>
                                        <span className={`status-chip status-${loan.status.toLowerCase()}`}>{loan.status}</span>
                                    </div>

                                    <div className="d-flex gap-2 align-items-start">
                                        {loan.status === 'PENDING' && (
                                            <>
                                                <button
                                                    type="button"
                                                    className="chip-btn chip-success"
                                                    onClick={() => updateStatus(loan.id, 'APPROVED')}
                                                >
                                                    <Check size={14} /> Approve
                                                </button>
                                                <button
                                                    type="button"
                                                    className="chip-btn chip-danger"
                                                    onClick={() => updateStatus(loan.id, 'REJECTED')}
                                                >
                                                    <X size={14} /> Reject
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default LoansCenter;
