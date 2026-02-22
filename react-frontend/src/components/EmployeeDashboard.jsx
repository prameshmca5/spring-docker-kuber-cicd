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
        <div className="dashboard-layout">
            <aside className="sidebar glass-panel">
                <div className="brand">
                    <div className="logo-box">
                        <Users size={28} className="text-white" />
                    </div>
                    <h2>EmpManage</h2>
                </div>
                <nav className="nav-menu">
                    <a href="#" className="nav-item active"><LayoutDashboard size={18} /> Dashboard</a>
                    <a href="#" className="nav-item"><Users size={18} /> Directory</a>
                </nav>
            </aside>

            <main className="main-content">
                <header className="top-header">
                    <div>
                        <h1>Employee Directory</h1>
                        <p className="subtitle">Manage your team members and their roles.</p>
                    </div>

                </header>

                <div className="content-grid">
                    <section className="form-section">
                        <EmployeeForm onEmployeeAdded={fetchEmployees} />
                    </section>

                    <section className="table-section glass-panel">
                        <div className="table-header">
                            <h3><Users size={20} className="icon-inline" /> Current Team ({employees.length})</h3>
                        </div>

                        {loading ? (
                            <div className="loading-state">
                                <div className="spinner"></div>
                                <p>Loading directory...</p>
                            </div>
                        ) : error ? (
                            <div className="error-banner">{error}</div>
                        ) : employees.length === 0 ? (
                            <div className="empty-state">
                                <Users size={40} className="empty-icon" />
                                <p>No employees found. Add one to get started.</p>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="employee-table">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Employee</th>
                                            <th>Contact</th>
                                            <th>Department</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {employees.map(emp => (
                                            <tr key={emp.id}>
                                                <td>#{emp.id}</td>
                                                <td>
                                                    <div className="user-info">
                                                        <div className="avatar">
                                                            {emp.firstName.charAt(0)}{emp.lastName.charAt(0)}
                                                        </div>
                                                        <div className="name">
                                                            <span>{emp.firstName} {emp.lastName}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="contact-info">
                                                        <Mail size={14} /> {emp.emailId}
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="badge department-badge">
                                                        <Building size={12} /> {emp.department}
                                                    </span>
                                                </td>
                                                <td>
                                                    <button onClick={() => handleDelete(emp.id)} className="btn-icon btn-danger" title="Delete Employee">
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
            </main>
        </div>
    );
};

export default EmployeeDashboard;
