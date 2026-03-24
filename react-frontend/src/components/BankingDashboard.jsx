import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
    Bell,
    ChevronDown,
    ChevronRight,
    LayoutDashboard,
    LogOut,
    Menu,
    Settings,
    User,
    X,
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import NotificationService from '../services/NotificationService';
import {
    CUSTOMER_MENU_SECTIONS,
    OPERATIONS_MENU_ITEMS,
    getDashboardMeta,
} from '../config/bankingMenu';

const BankingDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const [notifications, setNotifications] = useState([]);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [expandedSections, setExpandedSections] = useState(() =>
        CUSTOMER_MENU_SECTIONS.reduce((state, section) => {
            state[section.id] = true;
            return state;
        }, {})
    );

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
    const pageMeta = getDashboardMeta(location.pathname);

    const handleSignOut = () => {
        logout();
        navigate('/login');
    };

    const closeMenus = () => {
        setShowUserMenu(false);
        setMobileMenuOpen(false);
    };

    const toggleSection = (sectionId) => {
        setExpandedSections((current) => ({
            ...current,
            [sectionId]: !current[sectionId],
        }));
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
                    <div className="nav-group-label">Customer Banking</div>

                    {CUSTOMER_MENU_SECTIONS.map((section) => {
                        const Icon = section.icon;
                        const isExpanded = expandedSections[section.id];
                        const isSectionActive =
                            location.pathname === section.to || location.pathname.startsWith(`${section.to}/`);

                        return (
                            <div key={section.id} className={`menu-group ${isSectionActive ? 'active' : ''}`}>
                                <button
                                    type="button"
                                    className="menu-section-toggle"
                                    onClick={() => toggleSection(section.id)}
                                >
                                    <span className="menu-section-label">
                                        <span className="menu-section-icon">
                                            <Icon size={18} />
                                        </span>
                                        <span>
                                            <strong>{section.label}</strong>
                                            <small>{section.caption}</small>
                                        </span>
                                    </span>
                                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                </button>

                                {isExpanded && (
                                    <div className="menu-subnav">
                                        <NavLink
                                            to={section.to}
                                            end
                                            className={({ isActive }) => `submenu-link ${isActive ? 'active' : ''}`}
                                            onClick={closeMenus}
                                        >
                                            <LayoutDashboard size={15} />
                                            <span>{section.label} Home</span>
                                        </NavLink>

                                        {section.items.map((item) => {
                                            const ItemIcon = item.icon;
                                            return (
                                                <NavLink
                                                    key={item.to}
                                                    to={item.to}
                                                    className={({ isActive }) => `submenu-link ${isActive ? 'active' : ''}`}
                                                    onClick={closeMenus}
                                                >
                                                    <ItemIcon size={15} />
                                                    <span>{item.label}</span>
                                                </NavLink>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    <div className="nav-group-label nav-group-label-spaced">Operations</div>

                    {OPERATIONS_MENU_ITEMS.map((item) => {
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
                        <h1>{pageMeta.title}</h1>
                        <p>{pageMeta.subtitle}</p>
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
