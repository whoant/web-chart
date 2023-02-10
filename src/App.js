import Chart from './component/chart/chart';
import { Container, Grid } from '@mui/material';
import { useState } from 'react';
import Papa from 'papaparse';
import ControlPanel from './component/controlPanel/controlPanel';
import { getChartFromBinance } from './helpers/binance';
import ControlInput from './component/controlInput/controlInput';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


function App() {
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

    const handleFileChange = (e) => {
        const typeChart = e.target.name;
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onload = async({ target }) => {
            const csv = Papa.parse(target.result, { header: true });
            const parsedData = csv?.data;
            const result = []
            parsedData.forEach(item => {
                const values = Object.values(item);
                if (values.length < 4) {
                    return;
                }
                const [timestamp, open, high, low, close] = values;

                result.push({
                    x: new Date(Number(timestamp)),
                    y: [Number(open), Number(high), Number(low), Number(close)]
                });
            });
            setChartData({ ...chartData, [typeChart]: result, interval: '', symbol: '' })
        };
        reader.readAsText(file);
    }

    const handleLoadClick = async formData => {
        const { symbol, interval, from, to } = formData;

        try {
            toast.success("Please wait !!!");
            const resp = await getChartFromBinance(symbol, '500', interval, { from, to });
            setChartData({ ...chartData, firstChart: resp, interval, symbol })

        } catch (e) {
            console.error(e);
            toast.error(`Error : ${e}`);
        }
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
                <ControlInput onFileChange={handleFileChange} onLoadClick={handleLoadClick}/>
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
