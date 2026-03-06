import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Send, RefreshCw, MessageSquare, Database, Activity } from 'lucide-react';

const KafkaSample = () => {
    const { user } = useContext(AuthContext);
    const [message, setMessage] = useState('');
    const [history, setHistory] = useState([]);
    const [isPublishing, setIsPublishing] = useState(false);
    const [isPolling, setIsPolling] = useState(false);
    const [publishStatus, setPublishStatus] = useState({ show: false, success: true, text: '' });

    const fetchMessages = async () => {
        setIsPolling(true);
        try {
            const res = await axios.get('/api/v1/kafka-sample/messages', {
                headers: { Authorization: `Bearer ${user?.token}` }
            });
            setHistory(res.data || []);
        } catch (err) {
            console.error("Failed to fetch Kafka sample messages", err);
        } finally {
            setIsPolling(false);
        }
    };

    useEffect(() => {
        fetchMessages();
        const intervalId = setInterval(fetchMessages, 3000);
        return () => clearInterval(intervalId);
    }, [user]);

    const handlePublish = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        setIsPublishing(true);
        setPublishStatus({ show: false, success: true, text: '' });

        try {
            await axios.post('/api/v1/kafka-sample/publish', { content: message }, {
                headers: { Authorization: `Bearer ${user?.token}` }
            });
            setPublishStatus({ show: true, success: true, text: 'Message successfully published to Kafka topic!' });
            setMessage('');
            setTimeout(() => setPublishStatus({ show: false, success: true, text: '' }), 4000);

            // Instantly fetch to see if it was consumed quickly
            setTimeout(fetchMessages, 500);
        } catch (err) {
            setPublishStatus({ show: true, success: false, text: 'Failed to publish message.' });
        } finally {
            setIsPublishing(false);
        }
    };

    return (
        <div className="row justify-content-center py-4 g-4 w-100 px-3">
            <div className="col-12 mb-2">
                <h3 className="fw-bold mb-1 d-flex align-items-center">
                    <Activity className="text-primary me-2" /> Kafka Pub/Sub Sample
                </h3>
                <p className="text-muted">Explore Request & Response behaviors using Kafka messaging</p>
            </div>

            <div className="col-12 col-lg-5">
                <div className="card shadow-sm border-0 rounded-4 p-4 h-100">
                    <div className="d-flex align-items-center mb-4 text-primary">
                        <Send size={22} className="me-2" />
                        <h5 className="fw-bold mb-0">Publish Message</h5>
                    </div>

                    <form onSubmit={handlePublish}>
                        <div className="mb-4">
                            <label className="form-label fw-semibold small text-muted">Payload Content</label>
                            <textarea
                                className="form-control"
                                rows="4"
                                placeholder="Enter a custom message to send into the Kafka topic..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                required
                            ></textarea>
                            <div className="form-text mt-2" style={{ fontSize: '0.8rem' }}>
                                This will format your message into a generic Kafka DTO and publish it to the <code>sample.topic</code> topic.
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="btn btn-primary w-100 py-2 fw-semibold d-flex justify-content-center align-items-center"
                            disabled={isPublishing || !message.trim()}
                        >
                            {isPublishing ? (
                                <><span className="spinner-border spinner-border-sm me-2" /> Publishing...</>
                            ) : (
                                <>Publish to Kafka <Send size={16} className="ms-2" /></>
                            )}
                        </button>
                    </form>

                    {publishStatus.show && (
                        <div className={`alert ${publishStatus.success ? 'alert-success' : 'alert-danger'} mt-4 py-2 small mb-0 d-flex align-items-center`} role="alert">
                            {publishStatus.text}
                        </div>
                    )}
                </div>
            </div>

            <div className="col-12 col-lg-7">
                <div className="card shadow-sm border-0 rounded-4 p-4 h-100">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <div className="d-flex align-items-center text-success">
                            <Database size={22} className="me-2" />
                            <h5 className="fw-bold mb-0">Consumed Responses</h5>
                        </div>
                        <button className="btn btn-light btn-sm text-secondary border d-flex align-items-center" onClick={fetchMessages} disabled={isPolling}>
                            <RefreshCw size={14} className={`me-2 ${isPolling ? 'spin-animation' : ''}`} />
                            Refresh
                        </button>
                    </div>

                    <div className="flex-grow-1 overflow-auto bg-light rounded-3 p-3 border" style={{ maxHeight: '400px' }}>
                        {history.length === 0 ? (
                            <div className="text-center text-muted py-5">
                                <MessageSquare size={32} className="mb-3 opacity-50" />
                                <p className="mb-0">No messages consumed yet.</p>
                                <small>Publish a message on the left to see it appear here.</small>
                            </div>
                        ) : (
                            <div className="d-flex flex-column gap-3">
                                {history.slice().reverse().map((msg, idx) => (
                                    <div key={idx} className="bg-white p-3 rounded shadow-sm border-start border-success border-4">
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <small className="font-monospace text-primary fw-bold" style={{ fontSize: '0.75rem' }}>
                                                ID: {msg.id ? msg.id.split('-').pop() : 'UNKNOWN'}
                                            </small>
                                            <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                                                {new Date(msg.timestamp).toLocaleTimeString()}
                                            </small>
                                        </div>
                                        <p className="mb-0 text-dark fw-medium">{msg.content}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <style>{`
                        .spin-animation { animation: spin 1s linear infinite; }
                        @keyframes spin { 100% { transform: rotate(360deg); } }
                    `}</style>
                </div>
            </div>
        </div>
    );
};

export default KafkaSample;
