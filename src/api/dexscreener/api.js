import axios from 'axios';
import { generateBarUrl } from './helpers';

const searchPairs = async pair => {
    const { data } = await axios.get(`https://api.dexscreener.com/latest/dex/search/?q=${pair}`);
    return data.pairs;
};

const getInfoPair = async(chainId, pairAddresses) => {
    const { data } = await axios.get(`https://api.dexscreener.com/latest/dex/pairs/${chainId}/${pairAddresses}`);
    return data.pair;
};

const getKLines = kLineRequest => {
    // const { network, smartContract, from, to, interval, limit } = kLineRequest;
    // const dexScreenerUrl = `https://io.dexscreener.com/u/chart/bars/${network}/${smartContract}?from=${from.unix() * 1000}&to=${(to.unix() + 1) * 1000}&res=${interval}&cb=${limit}`;
    const dexScreenerUrl = generateBarUrl(...kLineRequest);
    return fetchApiFromCloudflareWorker(dexScreenerUrl);
};

const getInfoPairByHtml = ({ chainId, pairAddress }) => {
    const url = `https://dexscreener.com/${chainId}/${pairAddress}?embed=1&trades=0&info=0&inverted=0&chartLeftTollbar=0&theme=light`;
    return fetchApiFromCloudflareWorker(url);
};

const fetchApiFromCloudflareWorker = async(url) => {
    const { data } = await axios.get(`https://cloudflare-worker.whoant.workers.dev/${url}`);
    return data;
};

export { searchPairs, getKLines, getInfoPairByHtml, fetchApiFromCloudflareWorker, getInfoPair };
