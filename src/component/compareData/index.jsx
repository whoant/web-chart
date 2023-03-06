import { useEffect, useState } from 'react';
import { calculateDifferentData, convertChartToMap } from '../../helpers/chart';
import { getChartFromBinance } from '../../api/binance/helpers';
import { toast } from 'react-toastify';
import { Container, Grid } from '@mui/material';
import Chart from '../chart/chart';
import ControlInput from '../controlInput/controlInput';
import ControlPanel from '../controlPanel/controlPanel';


function CompareData() {
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
    //
    // useEffect(() => {
    //     const test = async() => {
    //         const { data } = await axios.get("https://api.dexscreener.com/latest/dex/search/?q=BNB/USDT");
    //         console.log(data);
    //     }
    //
    //     test();
    // }, []);

    // useEffect(() => {
    //     const firstChart = getTempChartFromBinance();
    //     const secondChart = getTempChartFromDex('14/02/2023');
    //     const thirdChart = calculateThirdChart(firstChart, secondChart, 0.5);
    //     setOccurrenceCount(thirdChart.length);
    //     setChartData({ ...chartData, firstChart, secondChart, thirdChart })
    // }, []);


    const handleCalculateClick = async formData => {
        const thirdChart = calculateDifferentData(chartData.firstChart, chartData.secondChart, formData.threshold);
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

export default CompareData;
