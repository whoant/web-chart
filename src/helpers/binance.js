import { getKlines } from '../api/binance/api';
import { formatToTimestamp } from './time';

const getChartFromBinance = async(symbol, limit, interval, time) => {
    const { from, to } = time;

    const fromDate = new Date(formatTime(from));
    const toDate = new Date(formatTime(to));

    let result = [];
    let endTime = formatToTimestamp(toDate);
    let isShouldStop = false;

    while (isShouldStop === false) {
        try {
            const bars = await getKlines({ symbol, limit, interval, endTime });
            const newBarsReverse = bars.reverse();
            for (const bar of newBarsReverse) {
                const [timestamp, open, high, low, close] = bar;
                if (new Date(timestamp) < fromDate) {
                    isShouldStop = true;
                    break;
                }

                result.push({ x: new Date(timestamp), y: [Number(open), Number(high), Number(low), Number(close)] })
            }

            endTime = newBarsReverse[newBarsReverse.length - 1][0]
        } catch (e) {
            console.error(e);
            isShouldStop = true;
        }

    }
    return Promise.resolve(result.reverse());
};

function formatTime(time) {
    // time = 15/1/2022
    const timeSplit = time.split('/');
    const [day, month, year] = timeSplit;
    console.log(`${month}/${day}/${year}`);
    return `${month}/${day}/${year}`;
}


export { getChartFromBinance };
