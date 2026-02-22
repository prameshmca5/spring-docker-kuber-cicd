import React from 'react';
import { Settings as SettingsIcon, Bell, Lock, UserCog, Globe, ShieldCheck } from 'lucide-react';

const Settings = () => {
    return (
        <div className="card shadow-sm border-0">
            <div className="card-header bg-white pt-4 pb-3 border-bottom-0">
                <h3 className="card-title text-primary fw-bold mb-0 d-flex align-items-center">
                    <SettingsIcon className="me-3" size={28} />
                    Platform Settings
                </h3>
            </div>
            <div className="card-body p-4">
                <div className="row g-4">
                    <div className="col-md-3">
                        <div className="nav flex-column nav-pills" role="tablist" aria-orientation="vertical">
                            <button className="nav-link active text-start fw-medium d-flex align-items-center py-3 mb-2" data-bs-toggle="pill" type="button" role="tab" aria-selected="true">
                                <UserCog size={18} className="me-3" /> Profile
                            </button>
                            <button className="nav-link text-start text-dark fw-medium d-flex align-items-center py-3 mb-2 bg-light" data-bs-toggle="pill" type="button" role="tab" aria-selected="false">
                                <ShieldCheck size={18} className="me-3" /> Security
                            </button>
                            <button className="nav-link text-start text-dark fw-medium d-flex align-items-center py-3 mb-2 bg-light" data-bs-toggle="pill" type="button" role="tab" aria-selected="false">
                                <Bell size={18} className="me-3" /> Notifications
                            </button>
                            <button className="nav-link text-start text-dark fw-medium d-flex align-items-center py-3 bg-light" data-bs-toggle="pill" type="button" role="tab" aria-selected="false">
                                <Globe size={18} className="me-3" /> Preferences
                            </button>
                        </div>
                    </div>

                    <div className="col-md-9">
                        <div className="p-4 bg-light rounded-4 border h-100">
                            <h4 className="fw-bold mb-4">Profile Information</h4>
                            <form>
                                <div className="row mb-3">
                                    <div className="col-sm-6">
                                        <label className="form-label fw-bold text-muted small">First Name</label>
                                        <input type="text" className="form-control bg-white" defaultValue="Admin" />
                                    </div>
                                    <div className="col-sm-6 mt-3 mt-sm-0">
                                        <label className="form-label fw-bold text-muted small">Last Name</label>
                                        <input type="text" className="form-control bg-white" defaultValue="User" />
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <label className="form-label fw-bold text-muted small">Email Address</label>
                                    <input type="email" className="form-control bg-white" defaultValue="admin@cloudbanking.com" />
                                </div>

                                <hr className="my-4 opacity-50" />

                                <h4 className="fw-bold mb-4">Two-Factor Authentication</h4>
                                <div className="d-flex align-items-center justify-content-between bg-white p-3 rounded border">
                                    <div className="d-flex align-items-center">
                                        <div className="bg-success bg-opacity-10 text-success p-2 rounded me-3">
                                            <Lock size={20} />
                                        </div>
                                        <div>
                                            <h6 className="mb-0 fw-bold">Authenticator App</h6>
                                            <p className="mb-0 text-muted small">Protected via time-based codes.</p>
                                        </div>
                                    </div>
                                    <button type="button" className="btn btn-outline-danger btn-sm fw-medium">Disable</button>
                                </div>

                                <div className="mt-5 text-end">
                                    <button type="button" className="btn btn-primary px-4 fw-bold">Save Changes</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
