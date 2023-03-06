const convertChartToMap = chartData => {
    const map = new Map();
    chartData.forEach(data => {
        map.set(data.x.getTime(), data.y)
    });

    return map;
};

const calculateDifferentData = (firstChart, secondChart, threshold) => {
    const firstMapChart = convertChartToMap(firstChart);
    const secondMapChart = convertChartToMap(secondChart);
    const thirdChartData = [];
    for (const [key, value] of firstMapChart.entries()) {
        const firstData = value;
        const secondData = secondMapChart.get(key);
        if (secondData) {
            // console.log({ firstData, secondData })
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

export { convertChartToMap, calculateDifferentData };


//https://io.dexscreener.com/dex/chart/amm/uniswap/bars/bsc/0x7298bD9F23aB20380064ba7b5b343E067d9053BE?from=1677831840000&to=1677832092000&res=1&cb=2&q=0x55d398326f99059fF775485246999027B3197955
//https://io.dexscreener.com/dex/chart/amm/uniswap/bars/bsc/0x7298bD9F23aB20380064ba7b5b343E067d9053BE?from=1675875600000&to=1675962001000&res=30m&cb=48&q=0x55d398326f99059fF775485246999027B3197955
