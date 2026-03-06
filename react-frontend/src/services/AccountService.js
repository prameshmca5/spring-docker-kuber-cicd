import axios from 'axios';

// Ensure this points to the external address if testing via Minikube outside the cluster
// For local port forwarding via Minikube/Kubectl, using localhost mapping:
const API_URL = 'http://localhost/api/v1/accounts';

class AccountService {

    getAllAccounts() {
        return axios.get(API_URL);
    }

    getAccountsByCustomerId(customerId) {
        return axios.get(`${API_URL}/customer/${customerId}`);
    }

    createAccount(account) {
        return axios.post(API_URL, account);
    }
}

export default new AccountService();
