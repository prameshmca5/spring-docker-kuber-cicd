import React, { useState } from 'react';
import EmployeeService from '../services/EmployeeService';
import { UserPlus } from 'lucide-react';

const EmployeeForm = ({ onEmployeeAdded }) => {
    const [employee, setEmployee] = useState({ firstName: '', lastName: '', email: '', department: '' });
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
            setEmployee({ firstName: '', lastName: '', email: '', department: '' }); // Reset
            onEmployeeAdded(); // Trigger refresh in parent
        } catch (err) {
            console.error("Error creating employee", err);
            setError(err.response?.data?.message || "Failed to create employee.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card shadow-sm mb-4">
            <div className="card-header bg-white pt-3 pb-2">
                <h4 className="card-title mb-0 text-primary">
                    <UserPlus size={24} className="me-2 mb-1" />
                    Add New Employee
                </h4>
            </div>
            <div className="card-body">
                {error && <div className="alert alert-danger">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="row mb-3">
                        <div className="col-md-6">
                            <label className="form-label fw-bold">First Name</label>
                            <input type="text" className="form-control" name="firstName" value={employee.firstName} onChange={handleChange} required placeholder="Jane" />
                        </div>
                        <div className="col-md-6 mt-3 mt-md-0">
                            <label className="form-label fw-bold">Last Name</label>
                            <input type="text" className="form-control" name="lastName" value={employee.lastName} onChange={handleChange} required placeholder="Doe" />
                        </div>
                    </div>
                    <div className="row mb-4">
                        <div className="col-md-6">
                            <label className="form-label fw-bold">Email Address</label>
                            <input type="email" className="form-control" name="email" value={employee.email} onChange={handleChange} required placeholder="jane.doe@example.com" />
                        </div>
                        <div className="col-md-6 mt-3 mt-md-0">
                            <label className="form-label fw-bold">Department</label>
                            <input type="text" className="form-control" name="department" value={employee.department} onChange={handleChange} required placeholder="Engineering" />
                        </div>
                    </div>
                    <button type="submit" disabled={loading} className="btn btn-primary px-4 py-2">
                        {loading ? 'Adding...' : 'Save Employee'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EmployeeForm;
