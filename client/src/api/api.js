// api.js
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000',
});

// Set Authorization header globally if token exists in localStorage
const token = localStorage.getItem('accessToken');
if (token) {
    api.defaults.headers['Authorization'] = `Bearer ${token}`;
}

api.get('/api/auth/users') // This will cause a 404 error
  .catch(error => {
    if(error.response.data.message === 'Token missing, please log in' || error.response.data.message === 'Invalid or expired token, please log in'){
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
                const { data } = await axios.post('http://localhost:5000/api/auth/token', {
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
