import axios from 'axios';

const API_URL = '/api/v1/customers';

class CustomerService {
    getAllCustomers() {
        return axios.get(API_URL);
    }

    createCustomer(customer) {
        return axios.post(API_URL, customer);
    }

    getCustomerById(id) {
        return axios.get(`${API_URL}/${id}`);
    }

    updateCustomer(id, customer) {
        return axios.put(`${API_URL}/${id}`, customer);
    }

    deleteCustomer(id) {
        return axios.delete(`${API_URL}/${id}`);
    }
}

export default new CustomerService();
