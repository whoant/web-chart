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
import { reduceBars } from '../../api/dexscreener/helpers';

ControlInput.propTypes = {
    onFileChange: PropTypes.func,
    onLoadClick: PropTypes.func,
    onCalculateClick: PropTypes.func,
    isLoading: PropTypes.bool,
    occurrenceCount: PropTypes.number,
};

function ControlInput(props) {
    const { onFileChange, onLoadClick, isLoading, onCalculateClick, occurrenceCount } = props;
    const [linkDexScreener, setLinkDexScreener] = useState('');
    const [fileName, setFileName] = useState('Download file');
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

    const handleOnSubmit = e => {
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
        setLinkDexScreener(`https://io.dexscreener.com/u/chart/bars/${formInput.network}/${formInput.smartContract}?from=${from.unix() * 1000}&to=${(to.unix() + 1) * 1000}&res=${formInput.interval}&cb=${barsCount}`);
        setFileName(`${formInput.symbol}-${formInput.from}-${formInput.to}-${formInput.interval}`);
    }

    const handleFileSubmit = e => {
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onload = async({ target }) => {
            const parsedData = JSON.parse(target.result);
            const newBars = reduceBars(parsedData.bars, formInput.from);
            
            onFileChange(e, newBars);
        };
        reader.readAsText(file);
    };

    const handleInput = evt => {
        const name = evt.target.name;
        let newValue = evt.target.value;
        setFormInput({ ...formInput, [name]: newValue });
    };

    return (<Grid container spacing={2}>
        <Grid item xs={3}>
            <Grid container spacing={6}>
                <Grid item xs={12}>
                    <form onSubmit={handleOnSubmit} name="cex">
                        <TextField id="outlined-basic" margin="dense" label="From" variant="outlined" name="from"
                                   placeholder="1/1/2023" defaultValue={formInput.from} onChange={handleInput}/>
                        <TextField id="outlined-basic" margin="dense" label="To" variant="outlined" name="to"
                                   placeholder="10/1/2023" defaultValue={formInput.to} onChange={handleInput}/>
                    </form>
                </Grid>
            </Grid>
        </Grid>
        <Grid item xs={3}>
            <Grid container spacing={6}>
                <Grid item xs={12}>
                    <Button variant="contained" component="label">
                        Choose first file
                        <input hidden accept="text/csv" type="file" name="firstChart" onChange={handleFileSubmit}/>
                    </Button>
                </Grid>
                <Grid item xs={12}>
                    <form onSubmit={handleOnSubmit} name="cex">
                        <TextField id="outlined-basic" margin="dense" label="Symbol" variant="outlined" name="symbol"
                                   placeholder="BTCUSDT" defaultValue={formInput.symbol} onChange={handleInput}/>
                        <FormControl sx={{ m: 1, minWidth: 120 }}>
                            <InputLabel id="interval-label">Interval</InputLabel>
                            <Select
                                labelId="interval-label"
                                id="interval-helper"
                                value={formInput.interval}
                                label="Interval"
                                name="interval"
                                onChange={handleInput}>
                                <MenuItem value="1m">1m</MenuItem>
                                <MenuItem value="5m">5m</MenuItem>
                                <MenuItem value="15m">15m</MenuItem>
                                <MenuItem value="30m">30m</MenuItem>
                            </Select>
                        </FormControl>
                        <LoadingButton variant="contained" type="submit" loading={isLoading}>Submit</LoadingButton>
                    </form>
                </Grid>
            </Grid>
        </Grid>
        <Grid item xs={3}>
            <Grid container spacing={6}>
                <Grid item xs={12}>
                    <Button variant="contained" component="label" color="error">
                        Choose second file
                        <input hidden accept="text" type="file" name="secondChart"
                               onChange={handleFileSubmit}/>
                    </Button>
                </Grid>
                <Grid item xs={12}>
                    <form onSubmit={handleOnSubmit} name="dex">
                        <TextField id="outlined-basic" margin="dense" label="Network" variant="outlined" name="network"
                                   placeholder="bsc" defaultValue={formInput.network} onChange={handleInput}/>
                        <TextField id="outlined-basic" margin="dense" label="SmartContract" variant="outlined"
                                   name="smartContract"
                                   placeholder="" defaultValue={formInput.smartContract} onChange={handleInput}/>
                        <Button variant="contained" type="submit">Submit</Button>
                    </form>
                </Grid>
                <Grid item xs={12}>
                    {
                        linkDexScreener && (
                            <Link href={linkDexScreener} underline="always" target="_blank" download='abc.json'>
                                {fileName}
                            </Link>)
                    }
                </Grid>
            </Grid>
        </Grid>
        <Grid item xs={3}>
            <Grid container spacing={6}>
                <Grid item xs={12}>
                    <form onSubmit={handleOnSubmit} name="percent">
                        <TextField id="outlined-basic" margin="dense" label="Threshold" variant="outlined"
                                   name="threshold"
                                   placeholder="2" defaultValue={formInput.threshold} onChange={handleInput}/>
                        <Button variant="contained" type="submit">Calculate</Button>
                    </form>

                </Grid>
                <Grid item xs={6}>
                    <TextField
                        disabled
                        id="outlined-disabled"
                        label="Occurrence count"
                        value={occurrenceCount}
                    />
                </Grid>
                <Grid item xs={6}>
                    <TextField
                        disabled
                        id="outlined-disabled"
                        label="Occurrence count / day"
                        value={occurrenceCountPercent}
                    />
                </Grid>
            </Grid>
        </Grid>

    </Grid>);
}


export default ControlInput;
