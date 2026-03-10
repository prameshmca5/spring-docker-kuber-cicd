import React from 'react';
import { Activity, Banknote, ChartNoAxesColumn, PieChart } from 'lucide-react';

const REPORTS = [
    {
        title: 'Transaction Volume',
        value: '12,842',
        delta: '+8.4% this week',
        icon: ChartNoAxesColumn,
    },
    {
        title: 'Payment Success Rate',
        value: '99.1%',
        delta: '+0.3% from last month',
        icon: Activity,
    },
    {
        title: 'Active Accounts',
        value: '3,204',
        delta: '+125 new accounts',
        icon: Banknote,
    },
    {
        title: 'Segment Coverage',
        value: '84%',
        delta: 'Retail + Corporate mix',
        icon: PieChart,
    },
];

const ReportsCenter = () => {
    return (
        <section className="content-card">
            <header className="section-head">
                <h2>Reports & Analytics</h2>
                <p>Business visibility across operations and service delivery</p>
            </header>

            <div className="report-grid">
                {REPORTS.map((report) => {
                    const Icon = report.icon;
                    return (
                        <article key={report.title} className="report-card">
                            <div className="report-icon">
                                <Icon size={18} />
                            </div>
                            <h3>{report.title}</h3>
                            <strong>{report.value}</strong>
                            <p>{report.delta}</p>
                        </article>
                    );
                })}
            </div>
        </section>
    );
};

export default ReportsCenter;
