import React from 'react';
import { Landmark, ShieldCheck, Zap, Globe, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
    return (
        <div className="min-vh-100 d-flex flex-column bg-light">
            {/* Navbar */}
            <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm py-3 px-4">
                <div className="container-fluid">
                    <Link className="navbar-brand d-flex align-items-center fw-bold fs-4" to="/">
                        <div className="bg-white text-primary rounded-circle d-flex align-items-center justify-content-center me-3 shadow-sm" style={{ width: '45px', height: '45px' }}>
                            <Landmark size={26} strokeWidth={2.5} />
                        </div>
                        Cloud Banking Platform
                    </Link>
                    <div className="d-flex">
                        <Link to="/login" className="btn btn-outline-light me-3 fw-medium px-4 d-none d-sm-block">Login</Link>
                        <Link to="/login" className="btn btn-light text-primary fw-bold px-4 shadow-sm">Access Accounts</Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="flex-grow-1">
                <div className="bg-primary text-white text-center py-5 position-relative overflow-hidden">
                    <div className="container py-5 my-md-5 position-relative z-1">
                        <h1 className="display-4 fw-bolder mb-4">Welcome to the Future of Banking</h1>
                        <p className="lead mb-5 px-md-5 mx-md-5 text-white-50">
                            Experience seamless, secure, and lightning-fast financial services powered by our state-of-the-art microservices architecture. Your money, your control, anytime, anywhere.
                        </p>
                        <div className="d-flex justify-content-center gap-3">
                            <Link to="/login" className="btn btn-light btn-lg text-primary fw-bold px-5 py-3 shadow rounded-pill d-flex align-items-center">
                                Go to Dashboard <ArrowRight className="ms-2" size={20} />
                            </Link>
                        </div>
                    </div>
                    {/* Decorative Background Elements */}
                    <div className="position-absolute rounded-circle bg-white opacity-10" style={{ width: '600px', height: '600px', top: '-200px', right: '-100px' }}></div>
                    <div className="position-absolute rounded-circle bg-white opacity-10" style={{ width: '400px', height: '400px', bottom: '-150px', left: '-100px' }}></div>
                </div>

                {/* Features Section */}
                <div className="container py-5 my-5">
                    <div className="text-center mb-5 pb-3">
                        <h2 className="fw-bold text-dark display-5">Why Choose Us?</h2>
                        <p className="text-muted lead">Enterprise-grade banking solutions designed for everyone</p>
                    </div>
                    <div className="row g-4">
                        <div className="col-md-4">
                            <div className="card h-100 border-0 shadow-sm text-center p-4 transition-hover">
                                <div className="card-body">
                                    <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-inline-flex align-items-center justify-content-center mb-4" style={{ width: '80px', height: '80px' }}>
                                        <ShieldCheck size={40} />
                                    </div>
                                    <h4 className="fw-bold mb-3">Bank-Grade Security</h4>
                                    <p className="text-muted mb-0">Your funds and data are protected by industry-leading encryption and specialized microservices.</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="card h-100 border-0 shadow-sm text-center p-4 transition-hover">
                                <div className="card-body">
                                    <div className="bg-success bg-opacity-10 text-success rounded-circle d-inline-flex align-items-center justify-content-center mb-4" style={{ width: '80px', height: '80px' }}>
                                        <Zap size={40} />
                                    </div>
                                    <h4 className="fw-bold mb-3">Lightning Fast</h4>
                                    <p className="text-muted mb-0">Powered by a robust scalable backend, experience real-time transactions with zero downtime.</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="card h-100 border-0 shadow-sm text-center p-4 transition-hover">
                                <div className="card-body">
                                    <div className="bg-info bg-opacity-10 text-info rounded-circle d-inline-flex align-items-center justify-content-center mb-4" style={{ width: '80px', height: '80px' }}>
                                        <Globe size={40} />
                                    </div>
                                    <h4 className="fw-bold mb-3">Global Access</h4>
                                    <p className="text-muted mb-0">Manage your finances smoothly from anywhere in the world with our resilient cloud native platform.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-dark text-white-50 py-4 text-center mt-auto">
                <div className="container">
                    <p className="mb-0">&copy; 2026 Cloud Banking Platform. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
