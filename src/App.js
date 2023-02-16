import Chart from './component/chart/chart';
import { Container, Grid } from '@mui/material';
import { useEffect, useState } from 'react';
import ControlPanel from './component/controlPanel/controlPanel';
import { getChartFromBinance } from './api/binance/helpers';
import ControlInput from './component/controlInput/controlInput';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import getTempChartFromBinance from './data/binance-data';
import getTempChartFromDex from './data/dex-data';
import { convertChartToMap } from './helpers/chart';

function App() {
    const [isLoading, setIsLoading] = useState(false);
    const [occurrenceCount, setOccurrenceCount] = useState(0);
    const [chartData, setChartData] = useState({
        firstChart: [],
        secondChart: [],
        thirdChart: [],
        symbol: '',
        interval: ''
    });

    const [isShow, setIsShow] = useState({
        firstChart: true,
        secondChart: true,
        thirdChart: true
    });

    // useEffect(() => {
    //     const firstChart = getTempChartFromBinance();
    //     const secondChart = getTempChartFromDex('14/02/2023');
    //     const thirdChart = calculateThirdChart(firstChart, secondChart, 0.5);
    //     setOccurrenceCount(thirdChart.length);
    //     setChartData({ ...chartData, firstChart, secondChart, thirdChart })
    // }, []);

    const calculateThirdChart = (firstChart, secondChart, threshold) => {
        const firstMapChart = convertChartToMap(firstChart);
        const secondMapChart = convertChartToMap(secondChart);
        const thirdChartData = [];
        for (const [key, value] of firstMapChart.entries()) {
            const firstData = value;
            const secondData = secondMapChart.get(key);
            if (secondData) {
                const [, firstHigh, firstLow] = firstData;
                const [, secondHigh, secondLow] = secondData;
                const percentHigh = Math.abs((firstHigh - secondHigh) / firstHigh) * 100;
                const percentLow = Math.abs((firstLow - secondLow) / firstLow) * 100;

                if (percentHigh >= threshold || percentLow >= threshold) {
                    thirdChartData.push({
                        x: new Date(key),
                        y: firstHigh,
                        h: percentHigh,
                        l: percentLow
                    });
                }
            }
        }

        return thirdChartData;
    };

    const handleCalculateClick = async formData => {
        const thirdChart = calculateThirdChart(chartData.firstChart, chartData.secondChart, formData.threshold);
        setOccurrenceCount(thirdChart.length);
        setChartData({ ...chartData, thirdChart })
    };

    const handleFileChange = (e, result) => {
        const typeChart = e.target.name;
        setChartData({ ...chartData, [typeChart]: result })
    }

    const handleLoadClick = async formData => {
        const { symbol, interval, from, to } = formData;

        try {
            setIsLoading(true);
            const firstChart = await getChartFromBinance(symbol, '1000', interval, { from, to });
            setChartData({ ...chartData, firstChart, interval, symbol })
        } catch (e) {
            console.error(e);
            toast.error(`Error : ${e}`);
        }
        setIsLoading(false);
    }

    const handleShowChart = (event) => {
        setIsShow({
            ...isShow,
            [event.target.name]: event.target.checked
        })
    }

    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <Chart state={isShow} chartData={chartData}/>
            </Grid>
            <Grid item xs={10}>
                <ControlInput onFileChange={handleFileChange} onLoadClick={handleLoadClick} isLoading={isLoading}
                              onCalculateClick={handleCalculateClick} occurrenceCount={occurrenceCount}/>
            </Grid>
            <Grid item xs={2}>
                <Container maxWidth="sm">
                    <ControlPanel onShowChart={handleShowChart} state={isShow}/>
                </Container>
            </Grid>
        </Grid>
    );
}

export default App;
