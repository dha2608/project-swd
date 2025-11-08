import axios from 'axios';

const apiClient = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const loginUser = (credentials) => {
    return apiClient.post('/auth/login', credentials);
};

export const registerUser = (userData) => {
    return apiClient.post('/auth/register', userData);
};

export const getMe = () => {
    return apiClient.get('/auth/me');
}

export const getAvailableVehicles = () => {
    return apiClient.get('/vehicles/available');
};

export const getVehicles = (params) => {
    return apiClient.get('/vehicles', { params });
};

export const getVehicleById = (id) => {
    return apiClient.get(`/vehicles/${id}`);
};

export const getUsers = () => {
    return apiClient.get('/users');
};

export const getCustomers = () => {
    return apiClient.get('/crm/customers');
};

export const bookTestDrive = (formData) => {
    return apiClient.post('/crm/test-drives', formData);
};

export const getTestDrives = () => {
    return apiClient.get('/crm/test-drives');
}

export const submitFeedback = (formData) => {
    return apiClient.post('/crm/feedback', formData);
};

export const getFeedback = () => {
    return apiClient.get('/crm/feedback');
}

export const getCrmStatistics = () => {
    return apiClient.get('/crm/statistics');
}

export default apiClient;