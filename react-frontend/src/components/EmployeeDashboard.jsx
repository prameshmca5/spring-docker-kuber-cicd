import React, { useEffect, useState } from 'react';
import EmployeeService from '../services/EmployeeService';
import EmployeeForm from './EmployeeForm';
import { Users, Trash2, Mail, Building, LayoutDashboard, Search } from 'lucide-react';

const EmployeeDashboard = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            const response = await EmployeeService.getAllEmployees();
            setEmployees(response.data.data); // data.data because ApiResponse wrapper
            setError(null);
        } catch (err) {
            console.error("Error fetching employees:", err);
            setError("Failed to load employee data. Is the backend running?");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this employee?")) {
            try {
                await EmployeeService.deleteEmployee(id);
                fetchEmployees(); // refresh list
            } catch (err) {
                console.error("Error deleting employee:", err);
                alert("Failed to delete employee.");
            }
        }
    };

    return (
        <div className="row g-4">
            <div className="col-12 col-lg-4">
                <EmployeeForm onEmployeeAdded={fetchEmployees} />
            </div>

            <div className="col-12 col-lg-8">
                <div className="card shadow-sm">
                    <div className="card-header bg-white pt-3 pb-2 d-flex justify-content-between align-items-center">
                        <h4 className="card-title mb-0 text-primary">
                            <Users size={24} className="me-2 mb-1" />
                            Current Team ({employees.length})
                        </h4>
                    </div>

                    <div className="card-body p-0">
                        {loading ? (
                            <div className="text-center p-5">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                                <p className="mt-2 text-muted">Loading directory...</p>
                            </div>
                        ) : error ? (
                            <div className="alert alert-danger m-3">{error}</div>
                        ) : employees.length === 0 ? (
                            <div className="text-center p-5 text-muted">
                                <Users size={48} className="mb-3 text-secondary" />
                                <h5>No employees found</h5>
                                <p>Add one to get started.</p>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover table-striped align-middle mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th className="px-4 py-3">ID</th>
                                            <th className="py-3">Employee</th>
                                            <th className="py-3">Contact</th>
                                            <th className="py-3">Department</th>
                                            <th className="text-end px-4 py-3">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="border-top-0">
                                        {employees.map(emp => (
                                            <tr key={emp.id}>
                                                <td className="px-4"><strong>#{emp.id}</strong></td>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold me-3" style={{ width: '40px', height: '40px' }}>
                                                            {emp.firstName.charAt(0)}{emp.lastName.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <div className="fw-bold text-dark">{emp.firstName} {emp.lastName}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="text-secondary d-flex align-items-center">
                                                        <Mail size={16} className="me-2 text-muted" /> {emp.email}
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="badge bg-info text-dark bg-opacity-25 px-2 py-1 border border-info border-opacity-25 rounded-pill">
                                                        <Building size={14} className="me-1 mb-1" /> {emp.department}
                                                    </span>
                                                </td>
                                                <td className="text-end px-4">
                                                    <button onClick={() => handleDelete(emp.id)} className="btn btn-outline-danger btn-sm" title="Delete Employee">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeeDashboard;
