import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
    Activity,
    BarChart3,
    Bell,
    Building2,
    CreditCard,
    LayoutDashboard,
    LogOut,
    NotebookText,
    Menu,
    Settings,
    ShieldCheck,
    User,
    Users,
    Wallet,
    X,
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import NotificationService from '../services/NotificationService';

const MENU_ITEMS = [
    { to: '/dashboard', label: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/dashboard/accounts/list', label: 'Accounts', icon: CreditCard },
    { to: '/dashboard/transfers/list', label: 'Transfers', icon: Building2 },
    { to: '/dashboard/payments', label: 'Payments', icon: Wallet },
    { to: '/dashboard/employees', label: 'Employees', icon: Users },
    { to: '/dashboard/notifications', label: 'Notifications', icon: Bell },
    { to: '/dashboard/reports', label: 'Reports', icon: BarChart3 },
    { to: '/dashboard/loans', label: 'Loans', icon: ShieldCheck },
    { to: '/dashboard/audit', label: 'Audit', icon: NotebookText },
    { to: '/dashboard/kafka-sample', label: 'Events', icon: Activity },
    { to: '/dashboard/settings', label: 'Settings', icon: Settings },
];

const BankingDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const [notifications, setNotifications] = useState([]);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const fetchNotifications = async () => {
            const currentUserId = user?.id || user?.userId;
            if (!currentUserId) {
                setNotifications([]);
                return;
            }

            try {
                const response = await NotificationService.getNotifications(currentUserId);
                setNotifications(response.data || []);
            } catch {
                setNotifications([]);
            }
        };

        fetchNotifications();
        const intervalId = setInterval(fetchNotifications, 15000);
        return () => clearInterval(intervalId);
    }, [user]);

    const unreadCount = useMemo(() => notifications.length, [notifications]);

    const handleSignOut = () => {
        logout();
        navigate('/login');
    };

    const closeMenus = () => {
        setShowUserMenu(false);
        setMobileMenuOpen(false);
    };

    return (
        <div className="dashboard-shell">
            <div className={`dashboard-backdrop ${mobileMenuOpen ? 'show' : ''}`} onClick={() => setMobileMenuOpen(false)} />

            <aside className={`dashboard-sidebar ${mobileMenuOpen ? 'show' : ''}`}>
                <Link className="dashboard-brand" to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                    <span className="brand-mark">CB</span>
                    <span className="brand-text">Cloud Banking</span>
                </Link>

                <nav className="dashboard-nav">
                    {MENU_ITEMS.map((item) => {
                        const Icon = item.icon;
                        return (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                end={item.end}
                                className={({ isActive }) => `menu-link ${isActive ? 'active' : ''}`}
                                onClick={closeMenus}
                            >
                                <Icon size={18} />
                                <span>{item.label}</span>
                                {item.label === 'Notifications' && unreadCount > 0 && (
                                    <span className="menu-badge">{unreadCount}</span>
                                )}
                            </NavLink>
                        );
                    })}
                </nav>
            </aside>

            <div className="dashboard-main">
                <header className="dashboard-topbar">
                    <button
                        type="button"
                        className="icon-btn d-lg-none"
                        onClick={() => setMobileMenuOpen((prev) => !prev)}
                        aria-label="Toggle navigation"
                    >
                        {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>

                    <div className="topbar-title">
                        <h1>Professional Banking Workspace</h1>
                        <p>Manage accounts, payments, reports, and platform operations</p>
                    </div>

                    <div className="topbar-actions">
                        <NavLink to="/dashboard/notifications" className="icon-btn" aria-label="Notifications">
                            <Bell size={18} />
                            {unreadCount > 0 && <span className="top-badge">{unreadCount}</span>}
                        </NavLink>

                        <div className="user-menu-wrap">
                            <button type="button" className="user-pill" onClick={() => setShowUserMenu((prev) => !prev)}>
                                <span className="avatar-pill">{user?.username?.charAt(0)?.toUpperCase() || <User size={16} />}</span>
                                <span className="d-none d-md-inline">{user?.username || 'Bank User'}</span>
                            </button>

                            {showUserMenu && (
                                <div className="user-dropdown">
                                    <NavLink to="/dashboard/settings" className="dropdown-link" onClick={closeMenus}>
                                        <Settings size={16} />
                                        <span>Settings</span>
                                    </NavLink>
                                    <button type="button" className="dropdown-link danger" onClick={handleSignOut}>
                                        <LogOut size={16} />
                                        <span>Sign out</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                <main className="dashboard-content" onClick={() => setShowUserMenu(false)}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default BankingDashboard;
