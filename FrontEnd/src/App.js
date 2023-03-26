import { useState } from 'react';
import Chart from 'chart.js/auto';
//import 'chartjs-plugin-annotation';
import annotationPlugin from "chartjs-plugin-annotation";

function App() {
  const [file, setFile] = useState(null);

  const uploadCSV = () => {
    const csvFileInput = document.getElementById('csvFileInput');
    const file = csvFileInput.files[0];
    if (!file) {
      alert('Please select a file');
      return;
    }

    const formData = new FormData();
    formData.append('csvFile', file);

    fetch('http://localhost:3002/upload', {
      method: 'POST',
      body: formData
    })
      .then(response => {
        if (response.ok) {
          alert('File uploaded successfully');
          setFile(file);
        } else {
          alert('File upload failed');
        }
      })
      .catch(error => {
        alert('File upload failed: ' + error.message);
      });
  };

  const renderPlot = () => {
    const url = 'http://localhost:3002/chartDataLinearModel';
    fetch(url)
      .then(response => response.json())
      .then(data => {
        renderScatterPlotWithLinearModel(data);
      })
      .catch(error => console.error(error));
  };

  const renderScatterPlotWithLinearModel = (responseData) => {
    const dataPoints = responseData.chartData;
    const minX = responseData.linearModel.minX;
    const maxX = responseData.linearModel.maxX;
    const slope = responseData.linearModel.slope;
    const intercept = responseData.linearModel.intercept;

    const canvas = document.getElementById('myChart');

    // Set the canvas width and height
    canvas.width = 400;
    canvas.height = 300;
    Chart.register(annotationPlugin);

    // Create a new Chart.js chart
    const myChart = new Chart(canvas, {
      type: 'scatter',
      data: dataPoints,
      options: {
        responsive: false,
        scales: {
          xAxes: [{
            ticks: {
              autoSkip: true,
              maxTicksLimit: 10,
            },
          }],
          yAxes: [{
            ticks: {
              autoSkip: true,
              maxTicksLimit: 10,
            },
          }],
        },
        annotations: {
          lineAtZero: {
            type: 'line',
            mode: 'horizontal',
            scaleID: 'y-axis-1',
            value: intercept,
            borderColor: 'rgb(255, 0, 0)',
            borderWidth: 2,
            label: {
              backgroundColor: 'rgb(255, 0, 0)',
              content: `y = ${slope.toFixed(2)}x + ${intercept.toFixed(2)}`,
              enabled: true,
            },
          },
        },
      },
    });
  };

  return (
    <div>
      <form>
        <input type="file" id="csvFileInput" />
        <button type="button" onClick={uploadCSV}>Upload</button>
        <button type="button" onClick={renderPlot}>RenderPlot</button>
        <h1>Scatter Plot</h1>
        <canvas id="myChart"></canvas>
      </form>
    </div>
  );
}

export default App;
