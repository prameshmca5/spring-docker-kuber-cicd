import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Activity, Bell, Clock3, Filter, ReceiptText } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import NotificationService from '../services/NotificationService';
import TransactionService from '../services/TransactionService';

const TYPE_ALL = 'ALL';

const AuditCenter = () => {
    const { user } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const [activityItems, setActivityItems] = useState([]);
    const [typeFilter, setTypeFilter] = useState(TYPE_ALL);

    useEffect(() => {
        const currentUserId = user?.id || user?.userId;

        const loadAudit = async () => {
            setLoading(true);

            try {
                const [transactionsRes, notificationsRes] = await Promise.all([
                    TransactionService.getAllTransactions(),
                    currentUserId ? NotificationService.getNotifications(currentUserId) : Promise.resolve({ data: [] }),
                ]);

                const transactionItems = (transactionsRes?.data || []).map((transaction) => ({
                    id: `txn-${transaction.id || Math.random()}`,
                    type: 'TRANSACTION',
                    title: `Transaction ${transaction.transactionType || ''}`.trim(),
                    message: `Amount: ${transaction.amount ?? 'N/A'} | Account: ${transaction.accountId ?? 'N/A'}`,
                    timestamp: transaction.createdAt || transaction.timestamp || null,
                }));

                const notificationItems = (notificationsRes?.data || []).map((notification, index) => ({
                    id: `notif-${notification.id || index}`,
                    type: 'NOTIFICATION',
                    title: notification.title || 'Notification',
                    message: notification.message || 'No details',
                    timestamp: notification.timestamp || null,
                }));

                const merged = [...transactionItems, ...notificationItems].sort((a, b) => {
                    const aTs = a.timestamp ? new Date(a.timestamp).getTime() : 0;
                    const bTs = b.timestamp ? new Date(b.timestamp).getTime() : 0;
                    return bTs - aTs;
                });

                setActivityItems(merged);
            } catch {
                setActivityItems([]);
            } finally {
                setLoading(false);
            }
        };

        loadAudit();
    }, [user]);

    const filteredItems = useMemo(() => {
        if (typeFilter === TYPE_ALL) {
            return activityItems;
        }
        return activityItems.filter((item) => item.type === typeFilter);
    }, [activityItems, typeFilter]);

    return (
        <section className="content-card">
            <header className="section-head d-flex align-items-center justify-content-between flex-wrap gap-2">
                <div>
                    <h2>Audit Trail</h2>
                    <p>Combined timeline of notifications and transaction activity.</p>
                </div>
                <div className="d-flex align-items-center gap-2">
                    <Filter size={16} />
                    <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                        <option value={TYPE_ALL}>All</option>
                        <option value="TRANSACTION">Transactions</option>
                        <option value="NOTIFICATION">Notifications</option>
                    </select>
                </div>
            </header>

            {loading && <p className="muted-line mt-3">Loading audit events...</p>}

            {!loading && filteredItems.length === 0 && (
                <div className="empty-state mt-3">
                    <Activity size={20} />
                    <p>No audit records available for the selected filter.</p>
                </div>
            )}

            {!loading && filteredItems.length > 0 && (
                <div className="list-stack mt-3">
                    {filteredItems.map((item) => (
                        <article key={item.id} className="list-item">
                            <div className="list-item-icon">
                                {item.type === 'TRANSACTION' ? <ReceiptText size={16} /> : <Bell size={16} />}
                            </div>
                            <div>
                                <h3>{item.title}</h3>
                                <p>{item.message}</p>
                                <span className="muted-line small d-inline-flex align-items-center gap-1">
                                    <Clock3 size={14} />
                                    {item.timestamp ? new Date(item.timestamp).toLocaleString() : 'Time not available'}
                                </span>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
};

export default AuditCenter;
