import axios from './axiosClient';

const createBin = (content) => {
    return axios.post('/', content);
};

const readBin = (id) => {
    return axios.get(`/${id}`);
};

export { createBin, readBin };
