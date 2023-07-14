import { useEffect, useState } from 'react';
import { calculateDifferentData } from '../../helpers/chart';
import { getChartFromBinance } from '../../api/binance/helpers';
import { toast } from 'react-toastify';
import { Button, Container, FormControl, Grid, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import Chart from '../chart/chart';
import ControlPanel from '../controlPanel/controlPanel';
import { useParams } from 'react-router-dom';
import { createBin, readBin } from '../../api/paste/client';
import moment from 'moment/moment';
import { LoadingButton } from '@mui/lab';
import { calculateBarsEachInverval } from '../../helpers/time';
import { fetchApiFromCloudflareWorker, getInfoPair } from '../../api/dexscreener/api';
import { getDexFromPairAddress, reduceBars } from '../../api/dexscreener/helpers';

function CompareData() {
    const params = useParams();

    const [isLoading, setIsLoading] = useState(false);
    const [chartData, setChartData] = useState({
        firstChart: [],
        secondChart: [],
        thirdChart: [],
        symbol: 'BNBUSDT',
        interval: '1m',
        from: moment().subtract(2, 'days').format("DD/MM/YYYY"),
        to: moment().format("DD/MM/YYYY"),
        network: 'bsc',
        smartContract: '0x16b9a82891338f9ba80e2d6970fdda79d1eb0dae',
        threshold: 0,
    });

    const [occurrenceCount, setOccurrenceCount] = useState(0);
    const [occurrenceCountPercent, setOccurrenceCountPercent] = useState(0);
    const [isShow, setIsShow] = useState({
        firstChart: true,
        secondChart: true,
        thirdChart: true
    });

    useEffect(() => {
        const renderBin = async() => {
            if (params.id === undefined) return;
            const record = await readBin(params.id);
            const newChartData = { ...chartData };

            newChartData.firstChart = record.firstChart.map(data => {
                return {
                    ...data,
                    x: new Date(data.x)
                }
            });
            newChartData.secondChart = record.secondChart.map(data => {
                return {
                    ...data,
                    x: new Date(data.x)
                }
            });
            newChartData.symbol = record.baseSymbol.split('/').join("");
            newChartData.network = record.chainId;
            newChartData.interval = record.interval;
            newChartData.smartContract = record.pairAddress;
            newChartData.from = record.from;
            newChartData.to = record.to;

            setChartData(newChartData);
        };

        renderBin();
    }, []);

    useEffect(() => {
        const from = moment(chartData.from, "DD/MM/YYYY")
        const to = moment(chartData.to, "DD/MM/YYYY")
        const days = moment.duration(to.diff(from)).asDays();
        setOccurrenceCountPercent(occurrenceCount / days);
    }, [occurrenceCount])

    const handleCalculateClick = async e => {
        e.preventDefault();
        const thirdChart = calculateDifferentData(chartData.firstChart, chartData.secondChart, chartData.threshold);
        setOccurrenceCount(thirdChart.length);
        setChartData({ ...chartData, thirdChart })
    };


    const handleInput = evt => {
        const name = evt.target.name;
        let newValue = evt.target.value;
        setChartData({ ...chartData, [name]: newValue });
    };

    const handleBinanceClick = async e => {
        e.preventDefault();
        const { symbol, interval, from, to } = chartData;
        try {
            setIsLoading(true);
            const firstChart = await getChartFromBinance(symbol, '1000', interval, { from, to });
            setChartData({ ...chartData, firstChart })
        } catch (e) {
            console.error(e);
            toast.error(`Error : ${e}`);
        }
        setIsLoading(false);
    };

    const handleShowChart = (event) => {
        setIsShow({
            ...isShow,
            [event.target.name]: event.target.checked
        });
    };

    const handleDexClick = async e => {
        e.preventDefault();

        const from = moment(chartData.from, "DD/MM/YYYY");
        const to = moment(chartData.to, "DD/MM/YYYY");

        const barsCount = calculateBarsEachInverval(from, to, chartData.interval);
        const { chainId, pairAddress, quoteToken } = await getInfoPair(chartData.network, chartData.smartContract);
        const barUrl = await getDexFromPairAddress({
            chainId,
            pairAddress,
            interval: chartData.interval,
            from,
            to,
            barsCount,
            quoteAddress: quoteToken.address
        });
        const barFromDex = await fetchApiFromCloudflareWorker(barUrl.url);
        const secondChart = reduceBars(barFromDex.bars, chartData.from);
        setChartData({ ...chartData, secondChart });
    };

    return (
      <Grid container spacing={2}>
          <Grid item xs={12}>
              <Chart state={isShow} chartData={chartData}/>
          </Grid>
          <Grid item xs={10}>
              <Grid container spacing={2}>
                  <Grid item xs={3}>
                      <Grid container spacing={6}>
                          <Grid item xs={12}>
                              <form onSubmit={handleDexClick} name="cex">
                                  <TextField id="outlined-basic" margin="dense" label="From" variant="outlined"
                                             name="from"
                                             placeholder="1/1/2023" value={chartData.from}
                                             onChange={handleInput}/>
                                  <TextField id="outlined-basic" margin="dense" label="To" variant="outlined"
                                             name="to"
                                             placeholder="10/1/2023" value={chartData.to}
                                             onChange={handleInput}/>
                                  <FormControl sx={{ m: 1, minWidth: 120 }}>
                                      <InputLabel id="interval-label">Interval</InputLabel>
                                      <Select
                                        labelId="interval-label"
                                        id="interval-helper"
                                        value={chartData.interval}
                                        label="Interval"
                                        name="interval"
                                        onChange={handleInput}>
                                          <MenuItem value="1">1m</MenuItem>
                                          <MenuItem value="5">5m</MenuItem>
                                          <MenuItem value="15">15m</MenuItem>
                                          <MenuItem value="30">30m</MenuItem>
                                      </Select>
                                  </FormControl>
                              </form>
                          </Grid>
                      </Grid>
                  </Grid>
                  <Grid item xs={3}>
                      <Grid container spacing={6}>
                          <Grid item xs={12}>
                              <form onSubmit={handleBinanceClick} name="cex">
                                  <TextField id="outlined-basic" margin="dense" label="Symbol" variant="outlined"
                                             name="symbol"
                                             placeholder="BTCUSDT" value={chartData.symbol}
                                             onChange={handleInput}/>

                                  <LoadingButton variant="contained" type="submit"
                                                 loading={isLoading}>Submit CEX</LoadingButton>
                              </form>
                          </Grid>
                      </Grid>
                  </Grid>
                  <Grid item xs={3}>
                      <Grid container spacing={6}>
                          <Grid item xs={12}>
                              <form onSubmit={handleDexClick} name="dex">
                                  <TextField id="outlined-basic" margin="dense" label="Network" variant="outlined"
                                             name="network"
                                             placeholder="bsc" value={chartData.network}
                                             onChange={handleInput}/>
                                  <TextField id="outlined-basic" margin="dense" label="SmartContract"
                                             variant="outlined"
                                             name="smartContract"
                                             placeholder="" value={chartData.smartContract}
                                             onChange={handleInput}/>
                                  <LoadingButton variant="contained" type="submit">Submit DEX</LoadingButton>
                              </form>
                          </Grid>
                      </Grid>
                  </Grid>
                  <Grid item xs={3}>
                      <Grid container spacing={6}>
                          <Grid item xs={12}>
                              <form onSubmit={handleCalculateClick} name="percent">
                                  <TextField id="outlined-basic" margin="dense" label="Threshold" variant="outlined"
                                             name="threshold"
                                             placeholder="2" defaultValue={chartData.threshold}
                                             onChange={handleInput}/>
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
              </Grid>
          </Grid>
          <Grid item xs={2}>
              <Container maxWidth="sm">
                  <ControlPanel onShowChart={handleShowChart} state={isShow}/>
              </Container>
          </Grid>
      </Grid>
    );
}

export default CompareData;
