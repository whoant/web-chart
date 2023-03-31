import { useEffect, useState } from 'react';
import { calculateDifferentData } from '../../helpers/chart';
import { getChartFromBinance } from '../../api/binance/helpers';
import { toast } from 'react-toastify';
import { Container, Grid } from '@mui/material';
import Chart from '../chart/chart';
import ControlInput from '../controlInput/controlInput';
import ControlPanel from '../controlPanel/controlPanel';
import { useParams } from 'react-router-dom';
import { createBin, readBin } from '../../api/paste/client';

function CompareData() {
    const params = useParams();

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

    useEffect(() => {
        const renderBin = async() => {
            if (params.id === undefined) return;
            const record = await readBin(params.id);
            record.firstChart = record.firstChart.map(data => {
                return {
                    ...data,
                    x: new Date(data.x)
                }
            });
            record.secondChart = record.secondChart.map(data => {
                return {
                    ...data,
                    x: new Date(data.x)
                }
            });

            setChartData(record);
        };

        renderBin();
    }, []);

    const handleCalculateClick = async formData => {
        const thirdChart = calculateDifferentData(chartData.firstChart, chartData.secondChart, formData.threshold);
        setOccurrenceCount(thirdChart.length);
        setChartData({ ...chartData, thirdChart })
        const data = await createBin(JSON.stringify(chartData));
        console.log(data);
    };

    const handleFileChange = (e, result) => {
        const typeChart = e.target.name;
        setChartData({ ...chartData, [typeChart]: result })
    };

    const handleSecondChartSubmit = bars => {
        setChartData({ ...chartData, secondChart: bars });
    };

    const handleLoadClick = async formData => {
        const { symbol, interval, from, to } = formData;

        try {
            setIsLoading(true);
            const firstChart = await getChartFromBinance(symbol, '1000', interval, { from, to });
            console.log(firstChart);
            setChartData({ ...chartData, firstChart, interval, symbol })
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
        })
    };

    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <Chart state={isShow} chartData={chartData}/>
            </Grid>
            <Grid item xs={10}>
                <ControlInput onFileChange={handleFileChange} onLoadClick={handleLoadClick} isLoading={isLoading}
                              onCalculateClick={handleCalculateClick} occurrenceCount={occurrenceCount}
                              handleSecondChartSubmit={handleSecondChartSubmit}/>
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
