import axios from 'axios';

// The base API URL: use the environment variable for production
const API_BASE = process.env.REACT_APP_API_URL || "https://timetrackingapp.onrender.com";

// Create the axios instance with the dynamic base URL
const api = axios.create({
    baseURL: API_BASE,
});

// Set Authorization header globally if token exists in localStorage
const token = localStorage.getItem('accessToken');
if (token) {
    api.defaults.headers['Authorization'] = `Bearer ${token}`;
}

// Example GET request
api.get('/api/auth/users') // Should use the dynamic baseURL now
  .catch(error => {
    if (error.response && (error.response.data.message === 'Token missing, please log in' || error.response.data.message === 'Invalid or expired token, please log in')) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('username');
    } 
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response.status === 401 && localStorage.getItem('refreshToken')) {
            try {
                const { data } = await axios.post(`${API_BASE}/api/auth/token`, {
                    token: localStorage.getItem('refreshToken')
                });

                localStorage.setItem('accessToken', data.accessToken);
                originalRequest.headers['Authorization'] = `Bearer ${data.accessToken}`;
                return axios(originalRequest);
            } catch (err) {
                console.error('Token refresh failed');
            }
        }

        return Promise.reject(error);
    }
);

export default api;
