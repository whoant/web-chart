import axios from './axiosConfig';

const getKlines = (params) => {
    if (params.endTime === '') {
        delete params.endTime
    }
    return axios.get('/api/v3/uiKlines', {
        params
    })
};

export { getKlines }
