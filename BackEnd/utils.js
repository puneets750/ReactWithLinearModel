
const fs = require('fs');
const regression = require('regression');

function readCSV(filename) {
    const csvData = fs.readFileSync(filename, 'utf8');
    // Split the CSV data into an array of lines
    const csvLines = csvData.trim().split('\n');
    // Extract the headers and data from the CSV lines
    const headers = csvLines.shift().split(',');
    const data = csvLines.map((line) => line.split(','));
    return data;
}

function getLinearRegressionData(data) {
    const linerReggData = data.map((row) => ({ x: parseFloat(row[0]), y: parseFloat(row[1]) }));
    const dataAsArray = linerReggData.map(({ x, y }) => [x, y]);

    const { minX, maxX } = linerReggData.reduce(({ minX, maxX }, { x }) => ({
        minX: Math.min(minX, x),
        maxX: Math.max(maxX, x),
    }), { minX: Infinity, maxX: -Infinity });

    // Fit the linear regression model
    const result = regression.linear(dataAsArray);
    const slope = result.equation[0];
    const intercept = result.equation[1];
    var linearModel = {
        slope: slope,
        intercept: intercept,
        minX: minX,
        maxX: maxX
    };

    return linearModel;
}

function getChartData(data) {
    const chartData = {
        datasets: [
            {
                label: 'Data Points',
                data: data.map((row) => ({ x: parseFloat(row[0]), y: parseFloat(row[1]) })),
                pointBackgroundColor: 'blue',
                pointBorderColor: 'black',
                pointRadius: 5,
            },
        ],
    };
    return chartData;
}

module.exports = {
    readCSV: readCSV,
    getLinearRegressionData: getLinearRegressionData,
    getChartData: getChartData
  };