import axios from 'axios';

const instance = axios.create({
    baseURL: 'https://cloudflare-worker.whoant.workers.dev/https://paste.fyi',
    headers: {
        'Content-Type': 'text/plain'
    }
});

instance.interceptors.request.use(function(config) {

    return config;
}, function(error) {

    return Promise.reject(error);
});

// Add a response interceptor
instance.interceptors.response.use(function(response) {

    return response.data;
}, function(error) {

    return Promise.reject(error);
});

export default instance;
