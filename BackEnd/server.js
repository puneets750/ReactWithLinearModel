const express = require('express');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const cors = require('cors');
const utils = require('./utils.js');
const regression = require('regression');
const app = express();

app.use(fileUpload());
app.use(cors());

app.post('/upload', (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('No files were uploaded.');
  }
  fs.writeFileSync(req.files.csvFile.name, req.files.csvFile.data, (err) => {
    if (err) throw err;
    console.log('File saved!');
  });
  res.send('File uploaded successfully.');
});

app.get('/chartDataLinearModel', (req, res) => {

  const filename = req.query.filename;
  const csvData = fs.readFileSync(filename, 'utf8');

  // Split the CSV data into an array of lines
  const csvLines = csvData.trim().split('\n');

  // Extract the headers and data from the CSV lines
  const headers = csvLines.shift().split(',');
  const data = csvLines.map((line) => line.split(','));

  const linerRegg = data.map((row) => ({ x: parseFloat(row[0]), y: parseFloat(row[1]) }));
  const dataAsArray = linerRegg.map(({ x, y }) => [x, y]);

  const { minX, maxX } = linerRegg.reduce(({ minX, maxX }, { x }) => ({
    minX: Math.min(minX, x),
    maxX: Math.max(maxX, x),
  }), { minX: Infinity, maxX: -Infinity });

  // Fit the linear regression model
  const result = regression.linear(dataAsArray);
  //console.log(result);
  // Convert the CSV data into a format that can be used by Chart.js
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

  const slope = result.equation[0];
  const intercept = result.equation[1];
  var linearModel = {
    slope: slope,
    intercept: intercept,
    minX: minX,
    maxX: maxX
  };

  const response = {
    chartData: chartData,
    linearModel: linearModel
  };
  // Send the chart data as a response
  res.json(response);
});

app.get('/chartDataLinearModelV2', (req, res) => {
  const filename = req.query.filename;
  const data = utils.readCSV(filename);
  const response = {
    chartData: utils.getChartData(data),
    linearModel: utils.getLinearRegressionData(data)
  };
  // Send the chart data as a response
  res.json(response);
});

app.listen(3002, () => {
  console.log('Server listening on port 3002');
});
