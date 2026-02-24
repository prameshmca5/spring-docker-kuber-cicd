import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Shield, User, Lock, Mail, ArrowRight } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        try {
            await register(formData.username, formData.email, formData.password);
            setSuccess('Registration successful! Redirecting to login...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data || 'Failed to register account.');
        }
    };

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light" style={{
            backgroundImage: 'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)'
        }}>
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-md-7 col-lg-6 col-xl-5">
                        <div className="card shadow border-0 rounded-4 overflow-hidden" style={{
                            background: 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(10px)'
                        }}>
                            <div className="card-body p-4 p-sm-5">
                                <div className="text-center mb-4">
                                    <div className="bg-dark text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '56px', height: '56px' }}>
                                        <Shield size={28} />
                                    </div>
                                    <h3 className="fw-bold mb-1">Create Account</h3>
                                    <p className="text-muted small">Join NextGen Banking today</p>
                                </div>

                                {error && (
                                    <div className="alert alert-danger py-2 small fw-medium" role="alert">
                                        {error}
                                    </div>
                                )}
                                {success && (
                                    <div className="alert alert-success py-2 small fw-medium" role="alert">
                                        {success}
                                    </div>
                                )}

                                <form onSubmit={handleRegister}>
                                    <div className="mb-3 position-relative">
                                        <div className="position-absolute text-muted" style={{ left: '15px', top: '12px' }}>
                                            <User size={18} />
                                        </div>
                                        <input
                                            type="text"
                                            name="username"
                                            className="form-control form-control-lg bg-light border-0 ps-5"
                                            placeholder="Username"
                                            value={formData.username}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="mb-3 position-relative">
                                        <div className="position-absolute text-muted" style={{ left: '15px', top: '12px' }}>
                                            <Mail size={18} />
                                        </div>
                                        <input
                                            type="email"
                                            name="email"
                                            className="form-control form-control-lg bg-light border-0 ps-5"
                                            placeholder="Email Address"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="row g-3 mb-4">
                                        <div className="col-sm-6 position-relative">
                                            <div className="position-absolute text-muted" style={{ left: '22px', top: '12px' }}>
                                                <Lock size={18} />
                                            </div>
                                            <input
                                                type="password"
                                                name="password"
                                                className="form-control form-control-lg bg-light border-0 ps-5"
                                                placeholder="Password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                        <div className="col-sm-6 position-relative">
                                            <div className="position-absolute text-muted" style={{ left: '22px', top: '12px' }}>
                                                <Lock size={18} />
                                            </div>
                                            <input
                                                type="password"
                                                name="confirmPassword"
                                                className="form-control form-control-lg bg-light border-0 ps-5"
                                                placeholder="Confirm"
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <button type="submit" className="btn btn-dark btn-lg w-100 fw-semibold d-flex align-items-center justify-content-center gap-2 rounded-3 shadow-sm">
                                        Register Now <ArrowRight size={18} />
                                    </button>
                                </form>

                                <div className="text-center mt-4 pt-3 border-top">
                                    <p className="text-muted small mb-0">Already have an account? <Link to="/login" className="fw-bold text-decoration-none">Sign in</Link></p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
