import axios from 'axios';

const API_URL = '/api/v1/transactions';

class TransactionService {
    getAllTransactions() {
        return axios.get(API_URL);
    }

    createTransaction(transaction) {
        return axios.post(API_URL, transaction);
    }

    getTransactionById(id) {
        return axios.get(`${API_URL}/${id}`);
    }

    deleteTransaction(id) {
        return axios.delete(`${API_URL}/${id}`);
    }
}

export default new TransactionService();
