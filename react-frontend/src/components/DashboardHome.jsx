import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, Bell, CreditCard, NotebookText, ShieldCheck, Users, Wallet } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const QUICK_PANELS = [
    {
        title: 'Accounts',
        description: 'Review all customer accounts and open new account records.',
        icon: CreditCard,
        to: '/dashboard/accounts/list',
    },
    {
        title: 'Payments',
        description: 'Process secure card payments with status tracking.',
        icon: Wallet,
        to: '/dashboard/payments',
    },
    {
        title: 'Employees',
        description: 'Manage staff records and operating teams.',
        icon: Users,
        to: '/dashboard/employees',
    },
    {
        title: 'Reports',
        description: 'Check performance and service analytics quickly.',
        icon: BarChart3,
        to: '/dashboard/reports',
    },
    {
        title: 'Loans',
        description: 'Create and track customer loan requests.',
        icon: ShieldCheck,
        to: '/dashboard/loans',
    },
    {
        title: 'Audit',
        description: 'Review combined activity and system events.',
        icon: NotebookText,
        to: '/dashboard/audit',
    },
];

const DashboardHome = () => {
    const { user } = useContext(AuthContext);

    return (
        <div className="page-grid">
            <section className="hero-card">
                <div>
                    <p className="hero-kicker">Operations Console</p>
                    <h2>Welcome back, {user?.username || 'Team Member'}</h2>
                    <p>
                        This workspace gives you direct access to core banking workflows with cleaner navigation and
                        professional menu-driven screens.
                    </p>
                </div>
                <Link to="/dashboard/notifications" className="hero-action">
                    <Bell size={18} />
                    <span>View Notifications</span>
                </Link>
            </section>

            <section className="stats-row">
                <article className="stat-card">
                    <span>System Health</span>
                    <strong>Stable</strong>
                </article>
                <article className="stat-card">
                    <span>Environment</span>
                    <strong>Production Ready</strong>
                </article>
                <article className="stat-card">
                    <span>Security</span>
                    <strong>JWT Enabled</strong>
                </article>
            </section>

            <section className="quick-grid">
                {QUICK_PANELS.map((panel) => {
                    const Icon = panel.icon;
                    return (
                        <Link key={panel.title} to={panel.to} className="quick-card">
                            <div className="quick-icon">
                                <Icon size={18} />
                            </div>
                            <h3>{panel.title}</h3>
                            <p>{panel.description}</p>
                        </Link>
                    );
                })}
            </section>
        </div>
    );
};

export default DashboardHome;
