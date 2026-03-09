import axios from 'axios';
import { setupAxiosInterceptors } from '../utils/axiosInterceptor';
import { apiLogger } from '../utils/logger';

// Route via the Kubernetes Ingress seamlessly
const API_URL = '/api/v1/employees';

// Create axios instance with logging
const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000,
});

// Setup interceptors for automatic logging
setupAxiosInterceptors(axiosInstance);

class EmployeeService {
    getAllEmployees() {
        apiLogger.debug('Fetching all employees', { endpoint: API_URL });
        return axiosInstance.get('')
            .then(response => {
                apiLogger.info('Successfully fetched all employees', { count: response.data?.length || 0 });
                return response;
            })
            .catch(error => {
                apiLogger.error('Failed to fetch employees', {
                    status: error.response?.status,
                    message: error.message,
                });
                throw error;
            });
    }

    createEmployee(employeeData) {
        apiLogger.debug('Creating new employee', { employeeData, endpoint: API_URL });
        return axiosInstance.post('', employeeData)
            .then(response => {
                apiLogger.info('Employee created successfully', { employeeId: response.data?.id, status: response.status });
                return response;
            })
            .catch(error => {
                apiLogger.error('Failed to create employee', {
                    employeeData,
                    status: error.response?.status,
                    message: error.message,
                    validationErrors: error.response?.data?.errors,
                });
                throw error;
            });
    }

    getEmployeeById(employeeId) {
        const endpoint = `/${employeeId}`;
        apiLogger.debug(`Fetching employee details`, { employeeId, endpoint: `${API_URL}${endpoint}` });
        return axiosInstance.get(endpoint)
            .then(response => {
                apiLogger.info(`Successfully fetched employee ${employeeId}`, { employee: response.data?.name });
                return response;
            })
            .catch(error => {
                apiLogger.error(`Failed to fetch employee ${employeeId}`, {
                    employeeId,
                    status: error.response?.status,
                    message: error.message,
                });
                throw error;
            });
    }

    updateEmployee(employeeId, employeeData) {
        const endpoint = `/${employeeId}`;
        apiLogger.debug(`Updating employee`, { employeeId, employeeData, endpoint: `${API_URL}${endpoint}` });
        return axiosInstance.put(endpoint, employeeData)
            .then(response => {
                apiLogger.info(`Employee ${employeeId} updated successfully`, { status: response.status });
                return response;
            })
            .catch(error => {
                apiLogger.error(`Failed to update employee ${employeeId}`, {
                    employeeId,
                    employeeData,
                    status: error.response?.status,
                    message: error.message,
                });
                throw error;
            });
    }

    deleteEmployee(employeeId) {
        const endpoint = `/${employeeId}`;
        apiLogger.debug(`Deleting employee`, { employeeId, endpoint: `${API_URL}${endpoint}` });
        return axiosInstance.delete(endpoint)
            .then(response => {
                apiLogger.info(`Employee ${employeeId} deleted successfully`, { status: response.status });
                return response;
            })
            .catch(error => {
                apiLogger.error(`Failed to delete employee ${employeeId}`, {
                    employeeId,
                    status: error.response?.status,
                    message: error.message,
                });
                throw error;
            });
    }
}

export default new EmployeeService();


