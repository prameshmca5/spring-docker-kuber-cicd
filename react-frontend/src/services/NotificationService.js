import axios from 'axios';
import { setupAxiosInterceptors } from '../utils/axiosInterceptor';
import { apiLogger } from '../utils/logger';

// Assuming the API Gateway handles /api/v1/notifications routing
const API_URL = '/api/v1/notifications';

// Create axios instance with logging
const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000,
});

// Setup interceptors for automatic logging
setupAxiosInterceptors(axiosInstance);

const NotificationService = {
    getNotifications: (customerId) => {
        // We'll get the token from localStorage just like other services
        const token = localStorage.getItem('token');
        const endpoint = `/customer/${customerId}`;

        apiLogger.debug(`Fetching notifications for customer`, {
            customerId,
            endpoint: `${API_URL}${endpoint}`,
            hasAuth: !!token
        });

        return axiosInstance.get(endpoint, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(response => {
                apiLogger.info(`Successfully fetched notifications for customer ${customerId}`, {
                    count: response.data?.length || 0,
                    status: response.status
                });
                return response;
            })
            .catch(error => {
                apiLogger.error(`Failed to fetch notifications for customer ${customerId}`, {
                    customerId,
                    status: error.response?.status,
                    message: error.message,
                    hasAuth: !!token,
                });
                throw error;
            });
    }
};

export default NotificationService;


