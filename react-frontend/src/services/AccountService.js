import axios from 'axios';
import { setupAxiosInterceptors } from '../utils/axiosInterceptor';
import { apiLogger } from '../utils/logger';

// Ensure this points to the external address if testing via Minikube outside the cluster
// For local port forwarding via Minikube/Kubectl, using localhost mapping:
const API_URL = '/api/v1/accounts';

// Create axios instance with logging
const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000,
});

// Setup interceptors for automatic logging
setupAxiosInterceptors(axiosInstance);

// Enhanced request logging
axiosInstance.interceptors.request.use(
  config => {
    apiLogger.debug('AccountService request', {
      url: config.url,
      method: config.method,
      headers: config.headers,
      data: config.data,
      user: localStorage.getItem('username') || 'anonymous'
    });
    return config;
  },
  error => {
    apiLogger.error('AccountService request error', {
      message: error.message,
      config: error.config,
      user: localStorage.getItem('username') || 'anonymous'
    });
    return Promise.reject(error);
  }
);

// Enhanced response logging
axiosInstance.interceptors.response.use(
  response => {
    apiLogger.info('AccountService response', {
      url: response.config.url,
      status: response.status,
      data: response.data,
      headers: response.headers,
      user: localStorage.getItem('username') || 'anonymous'
    });
    return response;
  },
  error => {
    apiLogger.error('AccountService error', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      headers: error.response?.headers,
      user: localStorage.getItem('username') || 'anonymous'
    });
    if (error.response?.status === 401) {
      apiLogger.warn('AccountService unauthorized (401)', {
        url: error.config?.url,
        user: localStorage.getItem('username') || 'anonymous'
      });
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

class AccountService {

    getAllAccounts() {
        apiLogger.debug('Fetching all accounts', { endpoint: API_URL });
        return axiosInstance.get('')
            .then(response => {
                apiLogger.info('Successfully fetched all accounts', { count: response.data?.length || 0 });
                return response;
            })
            .catch(error => {
                apiLogger.error('Failed to fetch accounts', {
                    status: error.response?.status,
                    message: error.message,
                });
                throw error;
            });
    }

    getAccountsByCustomerId(customerId) {
        const endpoint = `/customer/${customerId}`;
        apiLogger.debug(`Fetching accounts for customer`, { customerId, endpoint: `${API_URL}${endpoint}` });
        return axiosInstance.get(endpoint)
            .then(response => {
                apiLogger.info(`Successfully fetched accounts for customer ${customerId}`, { count: response.data?.length || 0 });
                return response;
            })
            .catch(error => {
                apiLogger.error(`Failed to fetch accounts for customer ${customerId}`, {
                    customerId,
                    status: error.response?.status,
                    message: error.message,
                });
                throw error;
            });
    }

    createAccount(account) {
        apiLogger.debug('Creating new account', { accountData: account, endpoint: API_URL });
        return axiosInstance.post('', account)
            .then(response => {
                apiLogger.info('Account created successfully', { accountId: response.data?.id, status: response.status });
                return response;
            })
            .catch(error => {
                apiLogger.error('Failed to create account', {
                    accountData: account,
                    status: error.response?.status,
                    message: error.message,
                    validationErrors: error.response?.data?.errors,
                });
                throw error;
            });
    }
}

export default new AccountService();
