import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowUpRight,
    BarChart3,
    Bell,
    CreditCard,
    NotebookText,
    ShieldCheck,
    Users,
    Wallet,
} from 'lucide-react';
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

const TREND_SERIES = [
    { label: 'Mon', value: 42 },
    { label: 'Tue', value: 56 },
    { label: 'Wed', value: 48 },
    { label: 'Thu', value: 72 },
    { label: 'Fri', value: 68 },
    { label: 'Sat', value: 86 },
    { label: 'Sun', value: 79 },
];

const SERVICE_LOAD = [
    { label: 'Gateway', value: 94, tone: 'teal' },
    { label: 'Payments', value: 81, tone: 'blue' },
    { label: 'Accounts', value: 73, tone: 'green' },
    { label: 'Notify', value: 58, tone: 'amber' },
];

const CHANNEL_SHARE = [
    { label: 'Cards', value: 46, color: '#0ea5e9' },
    { label: 'UPI', value: 28, color: '#22c55e' },
    { label: 'Wire', value: 16, color: '#f59e0b' },
    { label: 'Cash', value: 10, color: '#94a3b8' },
];

const buildLinePath = (points, width, height, padding) => {
    const max = Math.max(...points.map((point) => point.value));
    const min = Math.min(...points.map((point) => point.value));
    const range = Math.max(max - min, 1);
    const stepX = (width - padding * 2) / (points.length - 1);

    return points
        .map((point, index) => {
            const x = padding + stepX * index;
            const y = height - padding - ((point.value - min) / range) * (height - padding * 2);
            return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
        })
        .join(' ');
};

const TrendChart = () => {
    const width = 420;
    const height = 180;
    const padding = 20;
    const path = buildLinePath(TREND_SERIES, width, height, padding);
    const areaPath = `${path} L ${width - padding} ${height - padding} L ${padding} ${height - padding} Z`;
    const max = Math.max(...TREND_SERIES.map((point) => point.value));
    const min = Math.min(...TREND_SERIES.map((point) => point.value));
    const range = Math.max(max - min, 1);
    const stepX = (width - padding * 2) / (TREND_SERIES.length - 1);

    return (
        <div className="chart-card chart-card-wide">
            <div className="chart-head">
                <div>
                    <p className="chart-eyebrow">Live Flow</p>
                    <h3>Weekly transaction movement</h3>
                </div>
                <span className="chart-delta positive">
                    <ArrowUpRight size={16} />
                    18.2%
                </span>
            </div>

            <svg viewBox={`0 0 ${width} ${height}`} className="trend-chart" role="img" aria-label="Weekly transaction trend">
                <defs>
                    <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.03" />
                    </linearGradient>
                </defs>
                {[0, 1, 2, 3].map((line) => {
                    const y = padding + ((height - padding * 2) / 3) * line;
                    return <line key={line} x1={padding} y1={y} x2={width - padding} y2={y} className="chart-grid-line" />;
                })}
                <path d={areaPath} fill="url(#trendFill)" />
                <path d={path} fill="none" stroke="#0ea5e9" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                {TREND_SERIES.map((point, index) => {
                    const x = padding + stepX * index;
                    const y = height - padding - ((point.value - min) / range) * (height - padding * 2);
                    return <circle key={point.label} cx={x} cy={y} r="5" className="chart-point" />;
                })}
            </svg>

            <div className="chart-axis">
                {TREND_SERIES.map((point) => (
                    <span key={point.label}>{point.label}</span>
                ))}
            </div>
        </div>
    );
};

const ServiceLoadChart = () => (
    <div className="chart-card">
        <div className="chart-head">
            <div>
                <p className="chart-eyebrow">Platform Load</p>
                <h3>Service request pressure</h3>
            </div>
        </div>

        <div className="bar-chart">
            {SERVICE_LOAD.map((item) => (
                <div key={item.label} className="bar-row">
                    <div className="bar-meta">
                        <span>{item.label}</span>
                        <strong>{item.value}%</strong>
                    </div>
                    <div className="bar-track">
                        <div className={`bar-fill ${item.tone}`} style={{ width: `${item.value}%` }} />
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const ShareRingChart = () => {
    let currentOffset = 0;
    const circumference = 2 * Math.PI * 54;

    return (
        <div className="chart-card">
            <div className="chart-head">
                <div>
                    <p className="chart-eyebrow">Channel Mix</p>
                    <h3>Payment distribution</h3>
                </div>
            </div>

            <div className="ring-layout">
                <div className="ring-chart-wrap">
                    <svg viewBox="0 0 140 140" className="ring-chart" role="img" aria-label="Payment channel distribution">
                        <circle cx="70" cy="70" r="54" className="ring-base" />
                        {CHANNEL_SHARE.map((item) => {
                            const dashLength = (item.value / 100) * circumference;
                            const segment = (
                                <circle
                                    key={item.label}
                                    cx="70"
                                    cy="70"
                                    r="54"
                                    fill="none"
                                    stroke={item.color}
                                    strokeWidth="14"
                                    strokeDasharray={`${dashLength} ${circumference - dashLength}`}
                                    strokeDashoffset={-currentOffset}
                                    strokeLinecap="round"
                                    transform="rotate(-90 70 70)"
                                />
                            );
                            currentOffset += dashLength;
                            return segment;
                        })}
                    </svg>
                    <div className="ring-center">
                        <strong>12.8k</strong>
                        <span>payments</span>
                    </div>
                </div>

                <div className="ring-legend">
                    {CHANNEL_SHARE.map((item) => (
                        <div key={item.label} className="legend-row">
                            <span className="legend-dot" style={{ backgroundColor: item.color }} />
                            <span>{item.label}</span>
                            <strong>{item.value}%</strong>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

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

            <section className="dashboard-graphs">
                <TrendChart />
                <ServiceLoadChart />
                <ShareRingChart />
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
