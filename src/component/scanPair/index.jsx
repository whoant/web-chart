import { useEffect, useReducer, useState } from 'react';
import { calculateBarChart } from '../../api/dexscreener/helpers';
import Textarea from '@mui/joy/Textarea';
import {
    Button, FormControl,
    Grid, InputLabel,
    Link, MenuItem,
    Paper, Select,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow, TextField
} from '@mui/material';
import moment from 'moment/moment';
import { LoadingButton } from '@mui/lab';

const SYMBOLS = [
    // 'APT/USDT',
    // 'BNB/USDT',
    'ETH/USDT'
];

const columns = [
    { id: 'name', label: 'Symbol' },
    { id: 'baseSymbol', label: 'Base symbol' },
    { id: 'chainId', label: 'Chain Id' },
    { id: 'pairAddress', label: 'Pair address' },
    { id: 'occurrenceCount', label: 'Occurrence count' },
];

function ScanPair() {
    const [pairs, setPairs] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [formInput, setFormInput] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            symbols: "ETH/USDT\nBNB/USDT",
            interval: "1m",
            from: moment().subtract(2, 'days').format("DD/MM/YYYY"),
            to: moment().format("DD/MM/YYYY"),
            threshold: 1
        }
    );


    const getAvailablePairs = async({ symbols, interval, from, to, threshold }) => {
        // const pairsInDex = await Promise.allSettled(SYMBOLS.map(s => searchPair(s)));
        // const bestPrices = await Promise.allSettled(SYMBOLS.map(s => {
        //     const symbol = convertPairToPlainText(s);
        //     return getBestPrice(symbol);
        // }));
        //
        // const availablePairs = [];
        // pairsInDex.forEach((pairs, index) => {
        //     if (pairs.status === 'rejected' || bestPrices[index].status === 'rejected') return;
        //     availablePairs.push(reducePairInDex(pairs.value, bestPrices[index].value.price));
        // });
        const newSymbols = symbols.split('\n');

        const newPairs = await Promise.allSettled(newSymbols.map(s => calculateBarChart({
            symbol: s,
            from,
            to,
            interval,
            threshold
        })));

        const availablePairs = [];
        let index = 0;
        newPairs.forEach(pairs => {
            if (pairs.status === 'rejected') return;
            pairs.value.forEach(p => availablePairs.push({ ...p, index }));
            index++;
        });
        setPairs(availablePairs);
        setIsLoading(false);
    };

    const handleOnSubmit = e => {
        e.preventDefault();
        console.log(formInput);
        setPairs([]);
        setIsLoading(true)
        getAvailablePairs(formInput);
    };
    
    const handleInput = evt => {
        const name = evt.target.name;
        let newValue = evt.target.value;
        setFormInput({ ...formInput, [name]: newValue });
    };

    return (
        <div>

            <form onSubmit={handleOnSubmit}>
                <Grid container>
                    <Grid item xs={6}>
                        <Textarea
                            minRows={4}
                            size="lg"
                            variant="outlined"
                            name="symbols"
                            defaultValue={formInput.symbols}
                            onChange={handleInput}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField id="outlined-basic" margin="dense" label="From" variant="outlined" name="from"
                                   placeholder="1/1/2023" defaultValue={formInput.from} onChange={handleInput}/>
                        <TextField id="outlined-basic" margin="dense" label="To" variant="outlined" name="to"
                                   placeholder="10/1/2023" defaultValue={formInput.to} onChange={handleInput}/>
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
                        <TextField id="outlined-basic" margin="dense" label="Threshold" variant="outlined"
                                   name="threshold"
                                   placeholder="2" defaultValue={formInput.threshold} onChange={handleInput}/>
                        {/*<Button variant="contained" type="submit">Scan</Button>*/}
                        <LoadingButton variant="contained" type="submit" loading={isLoading}>Scan</LoadingButton>
                    </Grid>
                </Grid>
            </form>

            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                <TableContainer sx={{ maxHeight: 540 }}>
                    <Table stickyHeader aria-label="sticky table">
                        <TableHead>
                            <TableRow hover role="checkbox" tabIndex={-1} key={1}>
                                {columns.map((column) => {
                                    return (
                                        <TableCell key={column.id}>
                                            {column.label}
                                        </TableCell>
                                    );
                                })}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {
                                pairs.map(p => {
                                    return (<TableRow hover role="checkbox" tabIndex={-1} key={p.pairAddress}>
                                        <TableCell>{p.symbol}</TableCell>
                                        <TableCell>{p.baseSymbol}</TableCell>
                                        <TableCell>{p.chainId}</TableCell>
                                        <TableCell>
                                            <Link target="_blank"
                                                  href={`https://dexscreener.com/${p.chainId}/${p.pairAddress}`}>{p.pairAddress}</Link>
                                        </TableCell>
                                        <TableCell>{p.occurrenceCount}</TableCell>
                                    </TableRow>);
                                })
                            }
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </div>
    )
}

export default ScanPair;
