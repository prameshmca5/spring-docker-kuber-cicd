import React, { useEffect, useState } from 'react';
import CustomerService from '../services/CustomerService';
import CustomerForm from './CustomerForm';
import { Users, Trash2, Mail, Phone, MapPin } from 'lucide-react';

const CustomerDashboard = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const response = await CustomerService.getAllCustomers();
            setCustomers(response.data);
            setError(null);
        } catch (err) {
            console.error("Error fetching customers:", err);
            setError("Failed to load customer data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this customer?")) {
            try {
                await CustomerService.deleteCustomer(id);
                fetchCustomers();
            } catch (err) {
                console.error("Error deleting customer:", err);
                alert("Failed to delete customer.");
            }
        }
    };

    return (
        <div className="dashboard-content-area">
            <header className="top-header">
                <div>
                    <h2>Customer Directory</h2>
                    <p className="subtitle">Manage bank customers and their details.</p>
                </div>
            </header>

            <div className="content-grid">
                <section className="form-section">
                    <CustomerForm onCustomerAdded={fetchCustomers} />
                </section>

                <section className="table-section glass-panel">
                    <div className="table-header">
                        <h3><Users size={20} className="icon-inline" /> Current Customers ({customers.length})</h3>
                    </div>

                    {loading ? (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>Loading directory...</p>
                        </div>
                    ) : error ? (
                        <div className="error-banner">{error}</div>
                    ) : customers.length === 0 ? (
                        <div className="empty-state">
                            <Users size={40} className="empty-icon" />
                            <p>No customers found. Add one to get started.</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="employee-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Name</th>
                                        <th>Contact</th>
                                        <th>Address</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {customers.map(cust => (
                                        <tr key={cust.id}>
                                            <td>#{cust.id}</td>
                                            <td>
                                                <div className="user-info">
                                                    <div className="avatar">
                                                        {cust.name ? cust.name.charAt(0).toUpperCase() : '?'}
                                                    </div>
                                                    <div className="name">
                                                        <span>{cust.name}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="contact-info">
                                                    <div><Mail size={14} /> {cust.email}</div>
                                                    <div><Phone size={14} /> {cust.phoneNumber}</div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="contact-info">
                                                    <MapPin size={14} /> {cust.address}
                                                </div>
                                            </td>
                                            <td>
                                                <button onClick={() => handleDelete(cust.id)} className="btn-icon btn-danger" title="Delete Customer">
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
        </div>
    );
};

export default CustomerDashboard;
