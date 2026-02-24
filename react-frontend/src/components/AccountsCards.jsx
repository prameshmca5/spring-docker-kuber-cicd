import React from 'react';
import { CreditCard, PlusCircle, ShieldCheck } from 'lucide-react';

const AccountsCards = () => {
    return (
        <div className="card shadow-sm border-0">
            <div className="card-header bg-white pt-4 pb-3 border-bottom-0">
                <h3 className="card-title text-primary fw-bold mb-0 d-flex align-items-center">
                    <CreditCard className="me-3" size={28} />
                    Accounts & Cards
                </h3>
            </div>
            <div className="card-body p-4">
                <div className="row g-4">
                    {/* Checking Account Card */}
                    <div className="col-md-6">
                        <div className="p-4 bg-primary text-white rounded-4 shadow position-relative overflow-hidden h-100">
                            <div className="position-absolute top-0 end-0 opacity-10 p-3">
                                <ShieldCheck size={120} />
                            </div>
                            <h5 className="mb-1 text-white-50 fw-semibold">Premium Checking</h5>
                            <h2 className="display-6 fw-bold mb-4">$24,562.00</h2>
                            <div className="d-flex justify-content-between align-items-end mt-4">
                                <div>
                                    <p className="mb-0 text-white-50 small">Account Number</p>
                                    <p className="mb-0 fw-medium">**** **** **** 4921</p>
                                </div>
                                <div className="bg-white bg-opacity-25 px-3 py-1 rounded-pill small fw-medium">
                                    Active
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Credit Card Card */}
                    <div className="col-md-6">
                        <div className="p-4 bg-dark text-white rounded-4 shadow position-relative overflow-hidden h-100">
                            <div className="position-absolute top-0 end-0 opacity-10 p-3">
                                <CreditCard size={120} />
                            </div>
                            <h5 className="mb-1 text-white-50 fw-semibold">Rewards Platinum Credit</h5>
                            <h2 className="display-6 fw-bold mb-4">$3,240.50 <span className="fs-6 text-white-50 fw-normal">/ $15,000 Limit</span></h2>
                            <div className="d-flex justify-content-between align-items-end mt-4">
                                <div>
                                    <p className="mb-0 text-white-50 small">Card Number</p>
                                    <p className="mb-0 fw-medium">**** **** **** 8834</p>
                                </div>
                                <div className="bg-white bg-opacity-25 px-3 py-1 rounded-pill small fw-medium">
                                    Active
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-5 text-center">
                    <button className="btn btn-outline-primary fw-bold px-4 py-2 rounded-pill d-inline-flex align-items-center">
                        <PlusCircle size={18} className="me-2" /> Open New Account
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AccountsCards;
