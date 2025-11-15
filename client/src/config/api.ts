import axios from 'axios';

const api = axios.create({
    // baseURL: 'http://localhost:5000/api',
    baseURL:'https://papertube-j60n.onrender.com/api',
    // baseURL: 'https://papertube.onrender.com/api',
    // baseURL: 'https://papertube-ybzq.onrender.com/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;