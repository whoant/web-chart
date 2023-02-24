import axios from './axiosConfig';

const getKlines = ({ symbol, limit, interval, endTime }) => {
    const params = { symbol, limit, interval, endTime };
    if (endTime === '') {
        delete params.endTime;
    }
    return axios.get('/api/v3/uiKlines', {
        params
    });
};

const getBestPrice = symbol => {
    return axios.get(`/api/v3/ticker/price?symbol=${symbol}`);
}

export { getKlines, getBestPrice };
