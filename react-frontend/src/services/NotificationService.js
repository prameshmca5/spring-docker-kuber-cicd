import axios from 'axios';

const API_URL = '/api/v1/notifications';

class NotificationService {
    getAllNotifications() {
        return axios.get(API_URL);
    }

    getNotificationById(id) {
        return axios.get(`${API_URL}/${id}`);
    }

    deleteNotification(id) {
        return axios.delete(`${API_URL}/${id}`);
    }
}

export default new NotificationService();
