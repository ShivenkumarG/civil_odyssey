let myChart = null;

const match = (x, y) => Math.abs(x - y) <= 0.125;

const makeChart = (a, b) => {
  const ctx = document.getElementById("myChart").getContext("2d");

  const xValues = Array.from({ length: 3000 }, (_, i) => i / 10);
  const yValues = xValues.map((x) => a * Math.exp(b * x));

  // Destroy the old chart if it exists
  if (myChart) {
    myChart.destroy();
  }
  
  myChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: xValues,
      datasets: [
        {
          label: ` ${a}e^(${b}x) `,
          data: yValues,
          borderColor: "rgba(75, 192, 192, 1)",
          backgroundColor: "rgba(75, 192, 192, 0.2)", // Adjust transparency for better visibility
          borderWidth: 2, // Increase line thickness for better visibility
          fill: true, // Fill area under the curve for better visualization
        },
      ],
    },
    options: {
      plugins: {
        tooltip: {
          mode: 'index',
          intersect: false,
        },
      },
      scales: {
        x: {
          type: "linear",
          position: "bottom",
          title: {
            display: true,
            text: 'Mean (in mm)', // Label for x-axis
          },
          grid: {
            display: true,
            color: 'rgba(0, 0, 0, 0.1)', // Adjust gridline color
          },
        },
        y: {
          type: "linear",
          position: "left",
          title: {
            display: true,
            text: 'Frequency Factor', // Label for y-axis
          },
          grid: {
            display: true,
            color: 'rgba(0, 0, 0, 0.1)', // Adjust gridline color
          },
        },
      },
      plugins: {
        legend: {
          display: true,
          labels: {
            color: 'rgba(0, 0, 0, 0.8)', // Adjust legend text color
          },
        },
        title: {
          display: true,
          text: 'Frequency Factor variation with mean', // Title for the chart
          color: 'rgba(0, 0, 0, 0.8)', // Adjust title text color
        },
      },
    },
  });

};

window.onload = async function () {
  // Load the csv file
  try {
    const response = await fetch("http://localhost:5500/yearly_cd_EC-Earth3-veg_final.csv");
    const data = await response.text();
    const results = Papa.parse(data, { header: true });
    window.data = results.data;
  } catch (err) {
    console.log(err);
  }
};

document.addEventListener("DOMContentLoaded", function () {
  const pmpForm = document.getElementById("pmpForm");
  const resultDiv = document.getElementById("result");

  pmpForm.addEventListener("submit", function (event) {
    event.preventDefault();

    let longitude = parseFloat(document.getElementById("longitude").value);
    let latitude = parseFloat(document.getElementById("latitude").value);

    // clear previous results
    resultDiv.innerHTML = "";

    const dataPoint = window.data.find(({ Longitude, Latitude }) => 
      match(parseFloat(Longitude), longitude) && match(parseFloat(Latitude), latitude)
    );

    if (dataPoint) {
      const { a, b, Estimated_PMP, Estimated_FF, Mean, ...rest } = dataPoint;
      resultDiv.innerHTML = ""; // Clear previous results
      
      // Create output container for the rest of the data
      const outputContainer = document.createElement("div");
      outputContainer.className = "output-container";
      
      // Create output container for the main results
      const mainResultsContainer = document.createElement("div");
      mainResultsContainer.className = "main-results-container";
    
      // Display Estimated_PMP, Estimated_FF, and Mean separately with highlighted colors
      const mainResults = [
        { name: 'Estimated PMP', value: Estimated_PMP },
        { name: 'Estimated FF', value: Estimated_FF },
        { name: 'Mean', value: Mean }
      ];
    
      mainResults.forEach(result => {
        const outputBox = document.createElement("div");
        outputBox.className = "output-box main-result-box";
    
        const outputName = document.createElement("div");
        outputName.className = "output-name main-result-name";
        outputName.innerText = result.name;
    
        const outputValue = document.createElement("div");
        outputValue.className = "output-value main-result-value";
        outputValue.innerText = result.value;
    
        outputBox.appendChild(outputName);
        outputBox.appendChild(outputValue);
    
        mainResultsContainer.appendChild(outputBox);
      });
    
      // Create and append images
      // const imageSrc = "images/photo.jpg"; // Adjust the image source as needed
      // const outputImage = document.createElement("img");
      // outputImage.className = "output-image";
      // outputImage.src = imageSrc;
    
      // outputContainer.appendChild(outputImage);
    
      // Display the rest of the data in output boxes
      let boxCounter = 0;
      const boxesPerRow = 4;
      let rowContainer = null;
      for (let key in rest) {
        if (boxCounter % boxesPerRow === 0) {
          rowContainer = document.createElement("div");
          rowContainer.className = "output-row";
          outputContainer.appendChild(rowContainer);
        }
    
        const outputBox = document.createElement("div");
        outputBox.className = "output-box";
    
        const outputName = document.createElement("div");
        outputName.className = "output-name";
        outputName.innerText = key;
    
        const outputValue = document.createElement("div");
        outputValue.className = "output-value";
        outputValue.innerText = rest[key];
    
        outputBox.appendChild(outputName);
        outputBox.appendChild(outputValue);
    
        rowContainer.appendChild(outputBox);
    
        boxCounter++;
      }
    
      resultDiv.appendChild(mainResultsContainer);
      resultDiv.appendChild(outputContainer);
    
      makeChart(parseFloat(a), parseFloat(b));
    } else {
      resultDiv.innerHTML = `
        <div style="text-align: center;"><br />
          <img src="images/Sorry_Image.jpeg" alt="Image" style="width: 400px; display: block; margin: 0 auto;"><br />
          <p style="text-align: center;">We couldn't find any data at the moment. Apologies for the inconvenience.<br /> 
          Our current focus is on India locations only. If you're searching, please verify your coordinates.</p>
        </div>`;
      if (myChart) {
        myChart.destroy();
      }
    }
  });
});