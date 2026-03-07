import axios from 'axios';

// Assuming the API Gateway handles /api/v1/notifications routing
const API_URL = '/api/v1/notifications';

const NotificationService = {
    getNotifications: (customerId) => {
        // We'll get the token from localStorage just like other services
        const token = localStorage.getItem('token');
        return axios.get(`${API_URL}/customer/${customerId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    }
};

export default NotificationService;
