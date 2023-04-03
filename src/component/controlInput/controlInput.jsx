import {
    Button,
    FormControl,
    Grid,
    InputLabel,
    Link,
    MenuItem,
    Select,
    TextField
} from '@mui/material';
import PropTypes from 'prop-types';
import { useEffect, useReducer, useState } from 'react';
import moment from 'moment';
import { LoadingButton } from '@mui/lab';
import { calculateBarsEachInverval } from '../../helpers/time';
import { getDexFromPairAddress, reduceBars } from '../../api/dexscreener/helpers';
import { fetchApiFromCloudflareWorker, getInfoPair } from '../../api/dexscreener/api';

ControlInput.propTypes = {
    onFileChange: PropTypes.func,
    onLoadClick: PropTypes.func,
    onCalculateClick: PropTypes.func,
    handleSecondChartSubmit: PropTypes.func,
    isLoading: PropTypes.bool,
    occurrenceCount: PropTypes.number,
};

function ControlInput(props) {
    const { onLoadClick, isLoading, onCalculateClick, occurrenceCount, handleSecondChartSubmit } = props;
    const [formInput, setFormInput] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            symbol: "BNBUSDT",
            interval: "1m",
            from: moment().subtract(2, 'days').format("DD/MM/YYYY"),
            to: moment().format("DD/MM/YYYY"),
            network: 'bsc',
            smartContract: '0x16b9a82891338f9ba80e2d6970fdda79d1eb0dae',
            threshold: 0,
        }
    );
    const [occurrenceCountPercent, setOccurrenceCountPercent] = useState(0);

    useEffect(() => {
        const from = moment(formInput.from, "DD/MM/YYYY")
        const to = moment(formInput.to, "DD/MM/YYYY")
        const days = moment.duration(to.diff(from)).asDays();
        setOccurrenceCountPercent(occurrenceCount / days);
    }, [occurrenceCount])

    const handleOnSubmit = async e => {
        e.preventDefault();
        const btnType = e.target.name

        if (btnType === 'cex') {
            onLoadClick(formInput);
            return;
        } else if (btnType === 'percent') {
            onCalculateClick(formInput);
            return;
        }
        const from = moment(formInput.from, "DD/MM/YYYY");
        const to = moment(formInput.to, "DD/MM/YYYY");

        const barsCount = calculateBarsEachInverval(from, to, formInput.interval);
        const { chainId, pairAddress, quoteToken } = await getInfoPair(formInput.network, formInput.smartContract);
        const barUrl = await getDexFromPairAddress({
            chainId,
            pairAddress,
            interval: formInput.interval,
            from,
            to,
            barsCount,
            quoteAddress: quoteToken.address
        });
        const barFromDex = await fetchApiFromCloudflareWorker(barUrl.url);
        const newBars = reduceBars(barFromDex.bars, formInput.from);
        handleSecondChartSubmit(newBars);
    };


    const handleInput = evt => {
        const name = evt.target.name;
        let newValue = evt.target.value;
        setFormInput({ ...formInput, [name]: newValue });
    };

    return (<div></div>);
}


export default ControlInput;
