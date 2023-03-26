const express = require('express');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const csv = require('csv-parser');
const cors = require('cors');
const { Chart } = require('chart.js/auto');
const simpleLinearRegression = require('simple-linear-regression');
const regression = require('regression');
const { createCanvas, loadImage } = require('canvas');
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

app.get('/chartDataV2', (req, res) => {

  const csvData = fs.readFileSync('da.csv', 'utf8');

  // Split the CSV data into an array of lines
  const csvLines = csvData.trim().split('\n');

  // Extract the headers and data from the CSV lines
  const headers = csvLines.shift().split(',');
  const data = csvLines.map((line) => line.split(','));

  const linerRegg = data.map((row) => ({ x: parseFloat(row[0]), y: parseFloat(row[1]) }));
  const dataAsArray = linerRegg.map(({ x, y }) => [x, y]);
  // Fit the linear regression model
  const result = regression.linear(dataAsArray);
  console.log(result);
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

  // Send the chart data as a response
  res.json(chartData);
});


app.get('/chartDataLinearModel', (req, res) => {

  const csvData = fs.readFileSync('da.csv', 'utf8');

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
  console.log(result);
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


//working code with chart.js version 4.x.x
app.get('/chartData', (req, res) => {
  const filename = req.query.filename;
  var data;

  // read the data from the CSV file
  fs.createReadStream(filename)
    .pipe(csv())
    .on('data', (row) => {
      // process each row of data and add it to the data array
      data.push({ x: parseInt(row.x), y: parseInt(row.y) });
    })
    .on('end', () => {
      // generate the chart data and send it back to the client as JSON
      const chartData = {
        datasets: [
          {
            label: 'Data',
            data: data,
            borderColor: 'blue',
            fill: false
          }
        ]
      };

      res.json(chartData);
    });
});

app.get('/scatter', (req, res) => {
  // Read the data from the CSV file
  const filename = req.query.filename;
  const data = [];
  fs.createReadStream(filename)
    .pipe(csv())
    .on('data', (row) => {
      data.push({ x: parseInt(row.x), y: parseInt(row.y) });
    })
    .on('end', () => {
      // Create a new canvas and chart instance
      const canvas = createCanvas(800, 600);
      const ctx = canvas.getContext('2d');
      const chart = new Chart(ctx, {
        type: 'scatter',
        data: {
          datasets: [{
            label: 'Scatter Dataset',
            data: data,
            backgroundColor: 'red',
          }]
        },
        options: {
          scales: {
            x: {
              type: 'linear',
              position: 'bottom',
            }
          }
        }
      });

      // Generate a PNG image of the chart
      const image = canvas.toBuffer('image/png');

      // Send the image as a PNG to the client
      res.writeHead(200, { 'Content-Type': 'image/png' });
      res.end(image);
    });
});

app.get('/file', (req, res) => {
  console.log("plot");
  const filename = req.query.filename;

  fs.createReadStream(filename)
    .pipe(csv())
    .on('data', (data) => {
      console.log(data);
      // send each row of data to client
      res.write(JSON.stringify(data));
    })
    .on('end', () => {
      console.log('CSV file successfully processed');
      // send end of response
      res.end();
    });
});

app.listen(3002, () => {
  console.log('Server listening on port 3002');
});
