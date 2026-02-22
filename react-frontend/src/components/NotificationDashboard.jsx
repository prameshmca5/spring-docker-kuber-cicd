import React, { useEffect, useState } from 'react';
import NotificationService from '../services/NotificationService';
import { Bell, Trash2, Calendar } from 'lucide-react';

const NotificationDashboard = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await NotificationService.getAllNotifications();
            setNotifications(response.data);
            setError(null);
        } catch (err) {
            console.error("Error fetching notifications:", err);
            setError("Failed to load notifications. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this notification?")) {
            try {
                await NotificationService.deleteNotification(id);
                fetchNotifications();
            } catch (err) {
                console.error("Error deleting notification:", err);
                alert("Failed to delete notification.");
            }
        }
    };

    return (
        <div className="dashboard-content-area w-full" style={{ padding: '0 2rem' }}>
            <header className="top-header">
                <div>
                    <h2>System Notifications</h2>
                    <p className="subtitle">Real-time alerts and event history.</p>
                </div>
            </header>

            <section className="table-section glass-panel">
                <div className="table-header">
                    <h3><Bell size={20} className="icon-inline" /> Alert History ({notifications.length})</h3>
                </div>

                {loading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                    </div>
                ) : error ? (
                    <div className="error-banner">{error}</div>
                ) : notifications.length === 0 ? (
                    <div className="empty-state">
                        <Bell size={40} className="empty-icon" />
                        <p>No notifications yet.</p>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="employee-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Reference ID</th>
                                    <th>Event Type</th>
                                    <th>Message</th>
                                    <th>Timestamp</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {notifications.map(note => (
                                    <tr key={note.id}>
                                        <td>#{note.id}</td>
                                        <td>#{note.referenceId}</td>
                                        <td>
                                            <span className="badge">
                                                {note.eventType}
                                            </span>
                                        </td>
                                        <td>{note.message}</td>
                                        <td>
                                            <div className="contact-info">
                                                <Calendar size={14} /> {new Date(note.timestamp).toLocaleString()}
                                            </div>
                                        </td>
                                        <td>
                                            <button onClick={() => handleDelete(note.id)} className="btn-icon btn-danger" title="Delete Notification">
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
};

export default NotificationDashboard;
