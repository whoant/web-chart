const convertChartToMap = chartData => {
    const map = new Map();
    chartData.forEach(data => {
        map.set(data.x.getTime(), data.y)
    });

    return map;
};

export { convertChartToMap };
