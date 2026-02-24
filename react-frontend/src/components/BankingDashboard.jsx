import React, { useContext, useState, useEffect } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Landmark, User, Bell, LayoutDashboard, CreditCard, ArrowRightLeft, Settings, LogOut, AlertTriangle, MessageSquare } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import NotificationService from '../services/NotificationService';

const BankingDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [showDropdown, setShowDropdown] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);

    useEffect(() => {
        const fetchNotifications = async () => {
            if (user?.userId) {
                try {
                    const response = await NotificationService.getNotifications(user.userId);
                    setNotifications(response.data);
                } catch (error) {
                    console.error("Failed to fetch notifications:", error);
                }
            }
        };

        // Fetch immediately on mount and then every 15 seconds
        fetchNotifications();
        const intervalId = setInterval(fetchNotifications, 15000);

        return () => clearInterval(intervalId);
    }, [user]);

    const confirmLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="container-fluid bg-light min-vh-100 d-flex flex-column p-0">
            {/* Top Navigation Bar */}
            <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm py-3 px-4">
                <div className="container-fluid">

                    {/* Brand Logo & Name */}
                    <Link className="navbar-brand d-flex align-items-center fw-bold fs-4" to="/">
                        <div className="bg-white text-primary rounded-circle d-flex align-items-center justify-content-center me-3 shadow-sm" style={{ width: '45px', height: '45px' }}>
                            <Landmark size={26} strokeWidth={2.5} />
                        </div>
                        Cloud Banking Platform
                    </Link>

                    {/* Mobile Toggle Button */}
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarText" aria-controls="navbarText" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>

                    {/* Navigation Links */}
                    <div className="collapse navbar-collapse" id="navbarText">
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-4 fs-6 fw-medium">
                            <li className="nav-item me-3">
                                <NavLink className={({ isActive }) => `nav-link d-flex align-items-center ${isActive ? 'active fw-bold' : 'text-white-50 hover-opacity'}`} to="/dashboard" end>
                                    <LayoutDashboard size={18} className="me-2" /> Dashboard
                                </NavLink>
                            </li>
                            <li className="nav-item me-3">
                                <NavLink className={({ isActive }) => `nav-link d-flex align-items-center ${isActive ? 'active fw-bold' : 'text-white-50 hover-opacity'}`} to="/dashboard/accounts">
                                    <CreditCard size={18} className="me-2" /> Accounts & Cards
                                </NavLink>
                            </li>
                            <li className="nav-item me-3">
                                <NavLink className={({ isActive }) => `nav-link d-flex align-items-center ${isActive ? 'active fw-bold' : 'text-white-50 hover-opacity'}`} to="/dashboard/transfers">
                                    <ArrowRightLeft size={18} className="me-2" /> Transfers
                                </NavLink>
                            </li>
                            <li className="nav-item">
                                <NavLink className={({ isActive }) => `nav-link d-flex align-items-center ${isActive ? 'active fw-bold' : 'text-white-50 hover-opacity'}`} to="/dashboard/settings">
                                    <Settings size={18} className="me-2" /> Settings
                                </NavLink>
                            </li>
                        </ul>

                        {/* Right-aligned Profile & Notifications */}
                        <div className="d-flex align-items-center text-white position-relative">

                            {/* Notification Bell */}
                            <div className="position-relative me-4">
                                <button
                                    className="btn btn-link text-white p-0 position-relative"
                                    onClick={() => { setShowNotifications(!showNotifications); setShowDropdown(false); }}
                                >
                                    <Bell size={22} />
                                    {notifications.length > 0 && (
                                        <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.65rem' }}>
                                            {notifications.length}
                                            <span className="visually-hidden">unread messages</span>
                                        </span>
                                    )}
                                </button>

                                {/* Notification Dropdown Menu */}
                                {showNotifications && (
                                    <div className="dropdown-menu dropdown-menu-end shadow-lg border-0 mt-3 show p-0" style={{ position: 'absolute', top: '100%', right: '0', width: '320px', maxHeight: '400px', overflowY: 'auto' }}>
                                        <div className="bg-light p-3 border-bottom d-flex justify-content-between align-items-center rounded-top">
                                            <h6 className="mb-0 fw-bold">Notifications</h6>
                                            <span className="badge bg-primary rounded-pill">{notifications.length} New</span>
                                        </div>
                                        <div className="list-group list-group-flush">
                                            {notifications.length === 0 ? (
                                                <div className="p-4 text-center text-muted">
                                                    <MessageSquare size={24} className="mb-2 opacity-50" />
                                                    <p className="mb-0 small">No new notifications</p>
                                                </div>
                                            ) : (
                                                notifications.map((notif, idx) => (
                                                    <div key={idx} className="list-group-item list-group-item-action py-3 px-3 border-bottom cursor-pointer hover-bg-light">
                                                        <div className="d-flex align-items-start">
                                                            <div className="bg-primary bg-opacity-10 text-primary p-2 rounded-circle me-3 mt-1">
                                                                <Bell size={16} />
                                                            </div>
                                                            <div>
                                                                <p className="mb-1 text-dark fs-6">{notif.message}</p>
                                                                <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                                                                    {new Date(notif.timestamp).toLocaleString()}
                                                                </small>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* User Profile */}
                            <div
                                className="d-flex align-items-center cursor-pointer"
                                role="button"
                                onClick={() => { setShowDropdown(!showDropdown); setShowNotifications(false); }}
                            >
                                <span className="me-2 fw-medium d-none d-md-block">{user?.username || 'Admin User'}</span>
                                <div className="bg-white text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-sm" style={{ width: '40px', height: '40px' }}>
                                    {user?.username?.charAt(0).toUpperCase() || <User size={20} />}
                                </div>
                            </div>

                            {showDropdown && (
                                <ul className="dropdown-menu dropdown-menu-end shadow-sm border-0 mt-2 show" style={{ position: 'absolute', top: '100%', right: '0' }}>
                                    <li><NavLink className="dropdown-item py-2" to="/dashboard/settings" onClick={() => setShowDropdown(false)}><Settings size={16} className="me-2" /> Settings</NavLink></li>
                                    <li><hr className="dropdown-divider my-1" /></li>
                                    <li><button className="dropdown-item py-2 text-danger" onClick={() => { setShowDropdown(false); setShowLogoutModal(true); }}><LogOut size={16} className="me-2" /> Sign out</button></li>
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Application Content Area */}
            <main className="container flex-grow-1 d-flex align-items-center justify-content-center py-5">
                <div className="w-100 w-xl-85 w-xxl-75">
                    <Outlet />
                </div>
            </main>

            {/* Logout Confirmation Modal */}
            {showLogoutModal && (
                <div className="modal-backdrop fade show" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal d-block" tabIndex="-1" role="dialog">
                        <div className="modal-dialog modal-dialog-centered" role="document">
                            <div className="modal-content shadow-lg border-0 rounded-4">
                                <div className="modal-body p-4 text-center">
                                    <div className="mb-3 text-warning">
                                        <AlertTriangle size={48} />
                                    </div>
                                    <h4 className="mb-3">Ready to Leave?</h4>
                                    <p className="text-muted mb-4">
                                        Are you sure you want to log out of your secure banking session?
                                    </p>
                                    <div className="d-flex justify-content-center gap-3">
                                        <button
                                            type="button"
                                            className="btn btn-light px-4 py-2 fw-medium border"
                                            onClick={() => setShowLogoutModal(false)}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-danger px-4 py-2 fw-medium"
                                            onClick={confirmLogout}
                                        >
                                            Yes, Log Out
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BankingDashboard;
