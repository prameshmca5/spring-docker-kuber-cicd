import axios from 'axios';

const API_URL = '/api/v1/transactions';

class TransactionService {

    getAllTransactions() {
        return axios.get(API_URL);
    }

    getTransactionsByAccountId(accountId) {
        return axios.get(`${API_URL}/account/${accountId}`);
    }

    createTransaction(transaction) {
        return axios.post(API_URL, transaction);
    }
}

export default new TransactionService();
