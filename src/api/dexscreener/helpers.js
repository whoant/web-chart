import moment from 'moment/moment';
import { fetchApiFromCloudflareWorker, getInfoPair, searchPair } from './api';
import { getBestPrice, getKlines } from '../binance/api';
import { convertPairToPlainText, getChartFromBinance } from '../binance/helpers';
import { calculateBarsEachInverval, formatToTimestamp } from '../../helpers/time';
import { calculateDifferentData } from '../../helpers/chart';

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
    try {
        const infoPairResp = await getInfoPair({ chainId, pairAddress });

        const regexp = /__SERVER_DATA =.(.*);<\/script>/gm;
        const res = regexp.exec(infoPairResp);
        const jsonParse = JSON.parse(res[1]);
        const dexId = jsonParse.route.data.pair.a;
        const url = generateBarUrl({ chainId, dexId, pairAddress, interval, from, to, barsCount, quoteAddress });
        return Promise.resolve({
            url,
            chainId, pairAddress
        });
    } catch (e) {
        return Promise.reject(e)
    }
};

const calculateBarChart = ({ symbol, from, to, interval, threshold }) => {
    return new Promise(async(resolve, reject) => {
        try {
            const [pairsExist, bestPrice] = await Promise.allSettled([searchPair(symbol), getBestPrice(convertPairToPlainText(symbol))]);
            if (pairsExist.status === 'rejected' || bestPrice.status === 'rejected') {
                return reject('rejected api')
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

            // const thirdChart = calculateThirdChart(chartData.firstChart, chartData.secondChart, formData.threshold);
            const availableData = [];
            barsFromDex.forEach((barFromDex, index) => {
                if (barFromDex.status === 'rejected') return;
                const formatBarsFromDex = reduceBars(barFromDex.value.bars, from)
                const differentData = calculateDifferentData(barFromCex, formatBarsFromDex, threshold);
                const occurrenceCount = `${differentData.length}/${barFromCex.length}`
                availableData.push({
                    ...availableUrls[index],
                    // barsFromDex: reduceBars(barFromDex.value.bars, from),
                    // barsFromCex: barFromCex,
                    baseSymbol: symbol,
                    occurrenceCount
                });
            });

            return resolve(availableData);
        } catch (e) {
            return reject(e);
        }
    })
};

export { reduceBars, reducePairInDex, generateBarUrl, calculateBarChart };
