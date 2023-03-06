import axios from 'axios';
import { generateBarUrl } from './helpers';

const searchPair = async pair => {
    try {
        const { data } = await axios.get(`https://api.dexscreener.com/latest/dex/search/?q=${pair}`);
        return Promise.resolve(data.pairs);
    } catch (e) {
        return Promise.reject(e);
    }
};

const getKLines = kLineRequest => {
    // const { network, smartContract, from, to, interval, limit } = kLineRequest;
    // const dexScreenerUrl = `https://io.dexscreener.com/u/chart/bars/${network}/${smartContract}?from=${from.unix() * 1000}&to=${(to.unix() + 1) * 1000}&res=${interval}&cb=${limit}`;
    const dexScreenerUrl = generateBarUrl(...kLineRequest);
    return fetchApiFromCloudflareWorker(dexScreenerUrl);
};

const getInfoPair = ({ chainId, pairAddress }) => {
    const url = `https://dexscreener.com/${chainId}/${pairAddress}?embed=1&trades=0&info=0&inverted=0&chartLeftTollbar=0&theme=light`;
    return fetchApiFromCloudflareWorker(url);
};

const fetchApiFromCloudflareWorker = async(url) => {
    try {
        const { data } = await axios.get(`https://cloudflare-worker.whoant.workers.dev/${url}`);
        return Promise.resolve(data);
    } catch (e) {
        return Promise.reject(e);
    }
}

export { searchPair, getKLines, getInfoPair, fetchApiFromCloudflareWorker };
