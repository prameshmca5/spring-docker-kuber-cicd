import axios from 'axios';
import { setupAxiosInterceptors } from '../utils/axiosInterceptor';
import { apiLogger } from '../utils/logger';

const API_URL = '/api/v1/payments';

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000,
});

setupAxiosInterceptors(axiosInstance);

class PaymentService {
  getAllPayments() {
    apiLogger.debug('Fetching all payments', { endpoint: API_URL });
    return axiosInstance.get('');
  }

  getPaymentsByAccountId(accountId) {
    const endpoint = `/account/${accountId}`;
    apiLogger.debug('Fetching payments by account', { accountId, endpoint: `${API_URL}${endpoint}` });
    return axiosInstance.get(endpoint);
  }

  createPayment(payment) {
    apiLogger.debug('Creating payment', { endpoint: API_URL, payment });
    return axiosInstance.post('', payment);
  }
}

export default new PaymentService();
