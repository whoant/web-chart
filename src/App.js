import Chart from './component/chart/chart';
import { Container, Grid } from '@mui/material';
import { useState } from 'react';
import ControlPanel from './component/controlPanel/controlPanel';
import { getChartFromBinance } from './api/binance/helpers';
import ControlInput from './component/controlInput/controlInput';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
    const [loading, setLoading] = useState(false);
    const [chartData, setChartData] = useState({
        firstChart: [],
        secondChart: [],
        symbol: '',
        interval: ''
    });

    const [isShow, setIsShow] = useState({
        firstChart: true,
        secondChart: true
    });

    const handleFileChange = (e, result) => {
        const typeChart = e.target.name;
        setChartData({ ...chartData, [typeChart]: result, interval: '', symbol: '' })
    }

    const handleLoadClick = async formData => {
        const { symbol, interval, from, to } = formData;

        try {
            setLoading(true);
            const resp = await getChartFromBinance(symbol, '1000', interval, { from, to });
            setChartData({ ...chartData, firstChart: resp, interval, symbol })
        } catch (e) {
            console.error(e);
            toast.error(`Error : ${e}`);
        }
        setLoading(false);
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
                <Chart state={isShow}
                       chartData={chartData}/>
            </Grid>
            <Grid item xs={10}>
                <ControlInput onFileChange={handleFileChange} onLoadClick={handleLoadClick} loading={loading}/>
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
