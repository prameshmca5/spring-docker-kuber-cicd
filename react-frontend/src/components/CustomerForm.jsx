import React, { useState } from 'react';
import CustomerService from '../services/CustomerService';
import { UserPlus } from 'lucide-react';

const CustomerForm = ({ onCustomerAdded }) => {
    const [customer, setCustomer] = useState({
        name: '',
        email: '',
        phoneNumber: '',
        address: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCustomer({ ...customer, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await CustomerService.createCustomer(customer);
            setCustomer({ name: '', email: '', phoneNumber: '', address: '' });
            if (onCustomerAdded) onCustomerAdded();
        } catch (err) {
            console.error("Error creating customer:", err);
            setError("Failed to create customer. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-container glass-panel">
            <div className="form-header">
                <h3><UserPlus size={20} className="icon-inline" /> Add New Customer</h3>
            </div>
            {error && <div className="error-banner">{error}</div>}
            <form onSubmit={handleSubmit} className="custom-form">
                <div className="form-group">
                    <label>Name</label>
                    <input type="text" name="name" value={customer.name} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>Email</label>
                    <input type="email" name="email" value={customer.email} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>Phone Number</label>
                    <input type="text" name="phoneNumber" value={customer.phoneNumber} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>Address</label>
                    <input type="text" name="address" value={customer.address} onChange={handleChange} />
                </div>
                <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? 'Adding...' : 'Add Customer'}
                </button>
            </form>
        </div>
    );
};

export default CustomerForm;
