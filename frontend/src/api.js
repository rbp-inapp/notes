import axios from 'axios';

// Auth Service URL
const AUTH_URL = 'http://localhost:8001';
// Notes Service URL
const NOTES_URL = 'http://localhost:8002';

// Create API instances
const authApi = axios.create({
    baseURL: AUTH_URL,
});

const notesApi = axios.create({
    baseURL: NOTES_URL,
});

// Helper to get token
const getToken = () => localStorage.getItem('token');

// Add interceptor to notesApi to inject token
notesApi.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Add interceptor to handle 401s (token expire)
notesApi.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const auth = {
    login: async (username, password) => {
        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);
        const response = await authApi.post('/token', formData);
        return response.data;
    },
    register: async (username, password) => {
        const response = await authApi.post('/register', { username, password });
        return response.data;
    },
    logout: () => {
        localStorage.removeItem('token');
        window.location.href = '/login';
    }
};

export const notes = {
    getAll: async () => {
        const response = await notesApi.get('/notes/');
        return response.data;
    },
    create: async (title, content) => {
        const response = await notesApi.post('/notes/', { title, content });
        return response.data;
    },
    update: async (id, title, content) => {
        const response = await notesApi.put(`/notes/${id}`, { title, content });
        return response.data;
    },
    delete: async (id) => {
        const response = await notesApi.delete(`/notes/${id}`);
        return response.data;
    }
};
