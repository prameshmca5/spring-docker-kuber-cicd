import React, { useContext, useEffect, useState } from 'react';
import { Bell, Clock3 } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import NotificationService from '../services/NotificationService';

const NotificationsCenter = () => {
    const { user } = useContext(AuthContext);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNotifications = async () => {
            const currentUserId = user?.id || user?.userId;
            if (!currentUserId) {
                setLoading(false);
                return;
            }

            try {
                const response = await NotificationService.getNotifications(currentUserId);
                setNotifications(response.data || []);
            } catch {
                setNotifications([]);
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, [user]);

    return (
        <section className="content-card">
            <header className="section-head">
                <h2>Notification Center</h2>
                <p>Operational alerts and user-facing messages</p>
            </header>

            {loading && <p className="muted-line">Loading notifications...</p>}

            {!loading && notifications.length === 0 && (
                <div className="empty-state">
                    <Bell size={20} />
                    <p>No notifications available right now.</p>
                </div>
            )}

            {!loading && notifications.length > 0 && (
                <div className="list-stack">
                    {notifications.map((notification, index) => (
                        <article key={`${notification.id || index}`} className="list-item">
                            <div className="list-item-icon">
                                <Bell size={16} />
                            </div>
                            <div>
                                <h3>{notification.title || 'Notification'}</h3>
                                <p>{notification.message}</p>
                                {notification.timestamp && (
                                    <span className="muted-line small d-inline-flex align-items-center gap-1">
                                        <Clock3 size={14} />
                                        {new Date(notification.timestamp).toLocaleString()}
                                    </span>
                                )}
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
};

export default NotificationsCenter;
