import axios from 'axios';
import { setupAxiosInterceptors } from '../utils/axiosInterceptor';
import { apiLogger } from '../utils/logger';

const API_URL = '/api/v1/transactions';

// Create axios instance with logging
const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000,
});

// Setup interceptors for automatic logging
setupAxiosInterceptors(axiosInstance);

class TransactionService {

    getAllTransactions() {
        apiLogger.debug('Fetching all transactions', { endpoint: API_URL });
        return axiosInstance.get('')
            .then(response => {
                apiLogger.info('Successfully fetched all transactions', { count: response.data?.length || 0 });
                return response;
            })
            .catch(error => {
                apiLogger.error('Failed to fetch transactions', {
                    status: error.response?.status,
                    message: error.message,
                });
                throw error;
            });
    }

    getTransactionsByAccountId(accountId) {
        const endpoint = `/account/${accountId}`;
        apiLogger.debug(`Fetching transactions for account`, { accountId, endpoint: `${API_URL}${endpoint}` });
        return axiosInstance.get(endpoint)
            .then(response => {
                apiLogger.info(`Successfully fetched transactions for account ${accountId}`, { count: response.data?.length || 0 });
                return response;
            })
            .catch(error => {
                apiLogger.error(`Failed to fetch transactions for account ${accountId}`, {
                    accountId,
                    status: error.response?.status,
                    message: error.message,
                });
                throw error;
            });
    }

    createTransaction(transaction) {
        apiLogger.debug('Creating new transaction', { transactionData: transaction, endpoint: API_URL });
        return axiosInstance.post('', transaction)
            .then(response => {
                apiLogger.info('Transaction created successfully', { transactionId: response.data?.id, status: response.status });
                return response;
            })
            .catch(error => {
                apiLogger.error('Failed to create transaction', {
                    transactionData: transaction,
                    status: error.response?.status,
                    message: error.message,
                    validationErrors: error.response?.data?.errors,
                });
                throw error;
            });
    }
}

export default new TransactionService();


