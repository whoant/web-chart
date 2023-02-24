import moment from 'moment';

const COUNT_CANDLE_PER_DAY = {
    "1m": 60 * 24,
    "5m": 12 * 24,
    "15m": 4 * 24,
    "30m": 2 * 24,
};

const now = () => {
    return moment().unix()
};

const formatToTimestamp = time => {
    const date = moment(time).format('MM/DD/YYYY');
    return moment(date).format('x');
};

// calculate numbers of candle each interval
const calculateBarsEachInverval = (from, to, interval) => {
    const days = moment.duration(to.diff(from)).asDays();
    return days * COUNT_CANDLE_PER_DAY[interval]
};

export { now, formatToTimestamp, calculateBarsEachInverval };
