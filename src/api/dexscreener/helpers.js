import moment from 'moment/moment';
import { fetchApiFromCloudflareWorker, getInfoPairByHtml, searchPairs } from './api';
import { getBestPrice, getKlines } from '../binance/api';
import { convertPairToPlainText, getChartFromBinance } from '../binance/helpers';
import { calculateBarsEachInverval, formatToTimestamp } from '../../helpers/time';
import { calculateDifferentData } from '../../helpers/chart';
import { createBin } from '../paste/client';

const THRESHOLD = 10;

// Bars is out of time range will be reduced
const reduceBars = (bars, minFrom) => {
    const result = [];
    bars.forEach(bar => {
        const { close, high, low, open, timestamp } = bar;
        if (moment(timestamp) >= moment(minFrom, "DD/MM/YYYY")) {
            result.push({
                x: new Date(Number(timestamp)),
                y: [Number(open), Number(high), Number(low), Number(close)]
            });
        }
    });

    return result;
};

//  Pairs in dex do not have same priceB will be reduced
const reducePairInDex = (pairs, priceB) => {
    return pairs.filter(pair => {

        return Math.abs(priceB - pair.priceNative) / priceB * 100 < THRESHOLD
    });
};

// Generate bar url
const generateBarUrl = ({ chainId, dexId, pairAddress, from, to, interval, barsCount, quoteAddress }) => {
    return `https://io.dexscreener.com/dex/chart/amm/${dexId}/bars/${chainId}/${pairAddress}?from=${from.unix() * 1000}&to=${(to.unix() + 1) * 1000}&res=${interval}&cb=${barsCount}&q=${quoteAddress}`;
};


const getDexFromPairAddress = async({ chainId, pairAddress, from, to, interval, barsCount, quoteAddress }) => {
    const infoPairResp = await getInfoPairByHtml({ chainId, pairAddress });
    const regexp = /__SERVER_DATA =.(.*);<\/script>/gm;
    const res = regexp.exec(infoPairResp);
    const jsonParse = JSON.parse(res[1]);
    const dexId = jsonParse.route.data.pair.a;
    const url = generateBarUrl({ chainId, dexId, pairAddress, interval, from, to, barsCount, quoteAddress });

    return {
        url,
        chainId, pairAddress
    };
};

const calculateBarChart = async({ symbol, from, to, interval, threshold }) => {

    const [pairsExist, bestPrice] = await Promise.allSettled([searchPairs(symbol), getBestPrice(convertPairToPlainText(symbol))]);
    if (pairsExist.status === 'rejected' || bestPrice.status === 'rejected') {
        throw new Error('rejected api');
    }
    from = moment(from, "DD/MM/YYYY");
    to = moment(to, "DD/MM/YYYY");

    const availablePairs = reducePairInDex(pairsExist.value, bestPrice.value.price);
    const barsCount = calculateBarsEachInverval(from, to, interval);

    const barUrls = await Promise.allSettled(availablePairs.map(pair => {
        const { chainId, pairAddress, quoteToken } = pair;
        return getDexFromPairAddress({
            chainId,
            pairAddress,
            interval,
            from,
            to,
            barsCount,
            quoteAddress: quoteToken.address
        });
    }));

    const availableUrls = [];
    barUrls.forEach((bar, index) => {
        if (bar.status === 'rejected') return;
        const { baseToken, quoteToken } = availablePairs[index];
        availableUrls.push({
            symbol: `${baseToken.symbol}/${quoteToken.symbol}`,
            ...bar.value
        });
    });

    const barsFromDex = await Promise.allSettled(availableUrls.map(r => fetchApiFromCloudflareWorker(r.url)));
    const barFromCex = await getChartFromBinance(convertPairToPlainText(symbol), 1000, interval, {
        from: from.format("DD/MM/YYYY"),
        to: to.format("DD/MM/YYYY")
    });

    const availableData = await Promise.all(barsFromDex.map(async(barFromDex, index) => {
        if (barFromDex.status === 'rejected') return;
        const formatBarsFromDex = reduceBars(barFromDex.value.bars, from)
        const createBinResp = await createBin({
            firstChart: barFromCex,
            secondChart: formatBarsFromDex,
            from,
            to,
            interval,
            symbol: availableUrls[index].symbol
        });
        const [, id] = createBinResp.split('fyi/')

        const differentData = calculateDifferentData(barFromCex, formatBarsFromDex, threshold);
        const occurrenceCount = `${differentData.length}/${barFromCex.length}`
        return {
            ...availableUrls[index],
            baseSymbol: symbol,
            occurrenceCount,
            id,
        };
    }));

    return availableData;
};

export { reduceBars, reducePairInDex, generateBarUrl, calculateBarChart, getDexFromPairAddress };
