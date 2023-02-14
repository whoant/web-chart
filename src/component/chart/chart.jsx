import CanvasJSReact from '../../assets/canvasjs.react';
import React from 'react';
import PropTypes from 'prop-types';

const CanvasJSChart = CanvasJSReact.CanvasJSChart;

Chart.propTypes = {
    chartData: PropTypes.object,
    state: PropTypes.object
}

function Chart(props) {
    const { state, chartData } = props;

    const toogleDataSeries = (e) => {
        if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
            e.dataSeries.visible = false;
        } else {
            e.dataSeries.visible = true;
        }
        e.chart.render();
    }

    const options = {
        animationEnabled: false,
        theme: "dark1", // "light1", "light2", "dark1", "dark2"
        exportEnabled: true,
        title: {
            text: chartData.interval
        },
        zoomEnabled: true,
        axisX: {
            valueFormatString: "HH:mm DD/MM/YYYY",
            crosshair: {
                enabled: true,
                snapToDataPoint: true,
                valueFormatString: "HH:mm DD/MM/YYYY"
            }
        },
        axisY: {
            prefix: "",
            title: "Price",
            crosshair: {
                enabled: true,
                snapToDataPoint: true,
                valueFormatString: "#,###.##"
            }
        },
        toolTip: {
            shared: true
        },
        legend: {
            cursor: "pointer",
            itemclick: toogleDataSeries
        },
        data: [{
            type: "candlestick",
            showInLegend: true,
            name: `${chartData.symbol} Binance`,
            yValueFormatString: "###0.00",
            xValueFormatString: "HH:mm DD/MM/YYYY",
            visible: state.firstChart,
            dataPoints: chartData.firstChart
        },
            {
                type: "candlestick",
                showInLegend: true,
                name: `${chartData.symbol} DEX`,
                yValueFormatString: "###0.00",
                xValueFormatString: "HH:mm DD/MM/YYYY",
                visible: state.secondChart,
                dataPoints: chartData.secondChart
            }]
    }

    return (
        <CanvasJSChart options={options}/>
    )
}


export default Chart;
