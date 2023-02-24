import { getKlines } from './api';
import { formatToTimestamp } from '../../helpers/time';

const getChartFromBinance = async(symbol, limit, interval, time) => {
    const { from, to } = time;

    const fromDate = new Date(formatTime(from));
    const toDate = new Date(formatTime(to));

    let result = [];
    let endTime = formatToTimestamp(toDate);
    let shouldStop = false;

    while (shouldStop === false) {
        try {
            const bars = await getKlines({ symbol, limit, interval, endTime });
            const newBarsReverse = bars.reverse();
            for (const bar of newBarsReverse) {
                const [timestamp, open, high, low, close] = bar;
                if (new Date(timestamp) < fromDate) {
                    shouldStop = true;
                    break;
                }

                result.push({ x: new Date(timestamp), y: [Number(open), Number(high), Number(low), Number(close)] })
            }

            endTime = newBarsReverse[newBarsReverse.length - 1][0]
        } catch (e) {
            console.error(e);
            shouldStop = true;
        }

    }
    return Promise.resolve(result.reverse());
};

// convert DD/MM/YYYY -> MM/DD/YYYY
function formatTime(time) {
    // time = 15/1/2022
    const timeSplit = time.split('/');
    const [day, month, year] = timeSplit;
    return `${month}/${day}/${year}`;
}

// Convert ETH/USDT -> ETHUSDT
function convertPairToPlainText(pair) {
    return pair.split("/").join("");
}

export { getChartFromBinance, convertPairToPlainText };
