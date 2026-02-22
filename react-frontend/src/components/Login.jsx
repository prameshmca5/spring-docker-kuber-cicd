import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ShieldCheck, User, Lock, ArrowRight } from 'lucide-react';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const success = await login(username, password);
            if (success) {
                navigate('/dashboard');
            } else {
                setError('Invalid username or password');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        }
    };

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light" style={{
            backgroundImage: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
        }}>
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-md-6 col-lg-5 col-xl-4">
                        <div className="card shadow-lg border-0 rounded-4 overflow-hidden" style={{
                            background: 'rgba(255, 255, 255, 0.9)',
                            backdropFilter: 'blur(10px)'
                        }}>
                            <div className="card-body p-5">
                                <div className="text-center mb-4">
                                    <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px' }}>
                                        <ShieldCheck size={32} />
                                    </div>
                                    <h3 className="fw-bold mb-1">Welcome Back</h3>
                                    <p className="text-muted small">Sign in to access your secure dashboard</p>
                                </div>

                                {error && (
                                    <div className="alert alert-danger py-2 small fw-medium" role="alert">
                                        {error}
                                    </div>
                                )}

                                <form onSubmit={handleLogin}>
                                    <div className="mb-3 position-relative">
                                        <div className="position-absolute text-muted" style={{ left: '15px', top: '12px' }}>
                                            <User size={18} />
                                        </div>
                                        <input
                                            type="text"
                                            className="form-control form-control-lg bg-light border-0 ps-5"
                                            placeholder="Username"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="mb-4 position-relative">
                                        <div className="position-absolute text-muted" style={{ left: '15px', top: '12px' }}>
                                            <Lock size={18} />
                                        </div>
                                        <input
                                            type="password"
                                            className="form-control form-control-lg bg-light border-0 ps-5"
                                            placeholder="Password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <button type="submit" className="btn btn-primary btn-lg w-100 fw-semibold d-flex align-items-center justify-content-center gap-2 rounded-3 shadow-sm">
                                        Sign In <ArrowRight size={18} />
                                    </button>
                                </form>

                                <div className="text-center mt-4 pt-3 border-top">
                                    <p className="text-muted small mb-0">Don't have an account? <Link to="/register" className="fw-bold text-decoration-none">Sign up</Link></p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
