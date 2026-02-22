import React from 'react';
import { ArrowRightLeft, Send, Download } from 'lucide-react';

const Transfers = () => {
    return (
        <div className="card shadow-sm border-0">
            <div className="card-header bg-white pt-4 pb-3 border-bottom-0">
                <h3 className="card-title text-primary fw-bold mb-0 d-flex align-items-center">
                    <ArrowRightLeft className="me-3" size={28} />
                    Money Transfers
                </h3>
            </div>
            <div className="card-body p-4">
                <div className="row justify-content-center">
                    <div className="col-lg-8">
                        <div className="p-4 bg-light rounded-4 border">
                            <form>
                                <div className="mb-4">
                                    <label className="form-label fw-bold text-dark">From Account</label>
                                    <select className="form-select form-select-lg">
                                        <option>Premium Checking (**** 4921) - $24,562.00</option>
                                        <option>High Yield Savings (**** 1120) - $52,100.00</option>
                                    </select>
                                </div>

                                <div className="mb-4 text-center">
                                    <div className="bg-white p-2 d-inline-block rounded-circle shadow-sm border text-primary">
                                        <ArrowRightLeft size={24} />
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="form-label fw-bold text-dark">To Account / Recipient</label>
                                    <input type="text" className="form-control form-control-lg" placeholder="Enter Account Number or Email" />
                                </div>

                                <div className="mb-4">
                                    <label className="form-label fw-bold text-dark">Amount</label>
                                    <div className="input-group input-group-lg">
                                        <span className="input-group-text bg-white fw-bold">$</span>
                                        <input type="number" className="form-control" placeholder="0.00" />
                                    </div>
                                </div>

                                <div className="d-grid gap-2 mt-5">
                                    <button type="button" className="btn btn-primary btn-lg fw-bold d-flex align-items-center justify-content-center py-3">
                                        <Send size={20} className="me-2" /> Send Money Instantly
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

export default Transfers;
