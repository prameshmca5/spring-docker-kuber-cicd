import axios from 'axios';

const API_URL = '/api/v1/accounts';

class AccountService {
    getAllAccounts() {
        return axios.get(API_URL);
    }

    createAccount(account) {
        return axios.post(API_URL, account);
    }

    getAccountById(id) {
        return axios.get(`${API_URL}/${id}`);
    }

    updateAccount(id, account) {
        return axios.put(`${API_URL}/${id}`, account);
    }

    deleteAccount(id) {
        return axios.delete(`${API_URL}/${id}`);
    }
}

export default new AccountService();
