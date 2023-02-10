import moment from 'moment';

const now = () => {
    return moment().unix()
};

const formatToTimestamp = time => {
    const date = moment(time).format('MM/DD/YYYY');
    return moment(date).format('x');
};

export { now, formatToTimestamp };
