import axios from 'axios';

// Route via the Kubernetes Ingress seamlessly
const API_URL = '/api/v1/employees';

class EmployeeService {
    getAllEmployees() {
        return axios.get(API_URL);
    }

    createEmployee(employeeData) {
        return axios.post(API_URL, employeeData);
    }

    getEmployeeById(employeeId) {
        return axios.get(`${API_URL}/${employeeId}`);
    }

    updateEmployee(employeeId, employeeData) {
        return axios.put(`${API_URL}/${employeeId}`, employeeData);
    }

    deleteEmployee(employeeId) {
        return axios.delete(`${API_URL}/${employeeId}`);
    }
}

export default new EmployeeService();
