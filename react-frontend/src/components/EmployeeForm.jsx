import React, { useState } from 'react';
import EmployeeService from '../services/EmployeeService';
import { UserPlus } from 'lucide-react';

const EmployeeForm = ({ onEmployeeAdded }) => {
    const [employee, setEmployee] = useState({ firstName: '', lastName: '', emailId: '', department: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setEmployee({ ...employee, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await EmployeeService.createEmployee(employee);
            setEmployee({ firstName: '', lastName: '', emailId: '', department: '' }); // Reset
            onEmployeeAdded(); // Trigger refresh in parent
        } catch (err) {
            console.error("Error creating employee", err);
            setError(err.response?.data?.message || "Failed to create employee.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-panel form-container">
            <h3><UserPlus size={20} className="icon-inline" /> Add New Employee</h3>
            {error && <div className="error-banner">{error}</div>}
            <form onSubmit={handleSubmit} className="employee-form">
                <div className="form-group row">
                    <div className="col">
                        <label>First Name</label>
                        <input type="text" name="firstName" value={employee.firstName} onChange={handleChange} required placeholder="Jane" />
                    </div>
                    <div className="col">
                        <label>Last Name</label>
                        <input type="text" name="lastName" value={employee.lastName} onChange={handleChange} required placeholder="Doe" />
                    </div>
                </div>
                <div className="form-group row">
                    <div className="col">
                        <label>Email Address</label>
                        <input type="email" name="emailId" value={employee.emailId} onChange={handleChange} required placeholder="jane.doe@example.com" />
                    </div>
                    <div className="col">
                        <label>Department</label>
                        <input type="text" name="department" value={employee.department} onChange={handleChange} required placeholder="Engineering" />
                    </div>
                </div>
                <button type="submit" disabled={loading} className="btn-primary">
                    {loading ? 'Adding...' : 'Save Employee'}
                </button>
            </form>
        </div>
    );
};

export default EmployeeForm;
