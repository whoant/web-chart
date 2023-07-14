import moment from 'moment';

const COUNT_CANDLE_PER_DAY = {
  '1': 60 * 24,
  '5': 12 * 24,
  '15': 4 * 24,
  '30': 2 * 24,
};

const now = () => {
  return moment().unix()
};

const formatToTimestamp = (time, format = 'MM/DD/YYYY') => {
  const date = moment(time).format(format);
  return moment(date).format('x');
};

// calculate numbers of candle each interval
const calculateBarsEachInverval = (from, to, interval) => {
  const days = moment.duration(to.diff(from)).asDays();
  return days * COUNT_CANDLE_PER_DAY[interval]
};

export { now, formatToTimestamp, calculateBarsEachInverval };
