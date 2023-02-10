import axios from 'axios';

const instance = axios.create({
    baseURL: 'https://www.binance.com'
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

export default instance
