// URL of the CSV file
const csvUrl = "https://projects.fivethirtyeight.com/polls-page/data/president_polls.csv";


let fivethirtyEightPrediction = "N/A"; // Placeholder, updated after polling data is analyzed
let thirteenKeysPrediction = "N/A";    // Placeholder, updated dynamically from key statuses

// Initialize Chart.js with placeholder data (which will be updated after fetching the CSV)
const pollingData = {
    labels: [],  // Dates or other time labels will go here
    datasets: [
        {
            label: "Harris",
            data: [],  // Harris poll percentages will go here
            borderColor: "blue",
            fill: false
        },
        {
            label: "Trump",
            data: [],  // Trump poll percentages will go here
            borderColor: "red",
            fill: false
        }
    ]
};

function calculateThirteenKeysPrediction() {
    const positiveKeys = keysStatus.filter(key => key.status === "True").length;
    thirteenKeysPrediction = positiveKeys >= 7 ? "Trump" : "Harris";
    displayKeysStatus();  // Update visual display of key statuses
}

// Variables for Zoom and Scroll
let visibleDataRange = 30; // Default to show the last 30 data points
let startIndex = 0;  // Starting index of visible data

// Fetch and parse the CSV data
async function fetchPollingData() {
    try {
        const response = await fetch(csvUrl);
        const csvText = await response.text();

        // Parse CSV data with PapaParse
        const parsedData = Papa.parse(csvText, {
            header: true,    // Use the first row as headers
            dynamicTyping: true // Convert numeric values to numbers
        });

        // Process the parsed data for charting
        processData(parsedData.data);
    } catch (error) {
        console.error("Error fetching or parsing data:", error);
    }
}

// Process data to update the chart
function processData(data) {
    const harrisData = [];
    const trumpData = [];
    const labels = [];
    const startDate = new Date("2024-01-01");

    // Filter and format data for Harris and Trump starting from January 1, 2024
    data.forEach(row => {
        const pollDate = new Date(row.end_date);
        if (pollDate >= startDate) {
            if (row.candidate_name === "Kamala Harris") {
                harrisData.push(row.pct);
                labels.push(row.end_date);
            } else if (row.candidate_name === "Donald Trump") {
                trumpData.push(row.pct);
            }
        }
    });


        // Calculate polling prediction based on latest average values
        const harrisAvg = harrisData.reduce((a, b) => a + b, 0) / harrisData.length;
        const trumpAvg = trumpData.reduce((a, b) => a + b, 0) / trumpData.length;
        fivethirtyEightPrediction = harrisAvg > trumpAvg ? "Harris" : "Trump";

    // Update the chart data and display initial range
    pollingData.labels = labels;
    pollingData.datasets[0].data = harrisData;
    pollingData.datasets[1].data = trumpData;
    updateChart();
}

// Initialize the chart with Chart.js
const ctx = document.getElementById('pollingChart').getContext('2d');
const pollingChart = new Chart(ctx, {
    type: 'line',
    data: pollingData,
    options: {
        responsive: true,
        plugins: {
            legend: {
                position: 'top'
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 100
            }
        }
    }
});

// Update the chart to show only the visible range
function updateChart() {
    const endIndex = Math.min(startIndex + visibleDataRange, pollingData.labels.length);
    pollingChart.data.labels = pollingData.labels.slice(startIndex, endIndex);
    pollingChart.data.datasets[0].data = pollingData.datasets[0].data.slice(startIndex, endIndex);
    pollingChart.data.datasets[1].data = pollingData.datasets[1].data.slice(startIndex, endIndex);
    pollingChart.update();
}

// Call the function to fetch and display polling data
fetchPollingData();

// 13 Keys Model - Updated Status
const keysStatus = [
    { key: "Midterm Gains", status: "False" },
    { key: "Incumbency", status: "False" },
    { key: "Primary Contest", status: "True" },
    { key: "Third Party", status: "True" },
    { key: "Short-Term Economy", status: "True" },
    { key: "Long-Term Economy", status: "True" },
    { key: "Policy Change", status: "True" },
    { key: "Social Unrest", status: "True" },
    { key: "White House Scandal", status: "True" },
    { key: "Incumbent Charisma", status: "False" },
    { key: "Challenger Charisma", status: "True" },
    { key: "Foreign Policy Failure", status: "False" },
    { key: "Foreign Policy Success", status: "False" }
];

// Display Keys Status with Conditional Styling
function displayKeysStatus() {
    const keysContainer = document.getElementById("keysStatus");
    keysContainer.innerHTML = ""; // Clear any existing content

    keysStatus.forEach(key => {
        const keyElement = document.createElement("p");

        // Apply conditional styling based on the current party in office
        if (key.status === "True") {
            keyElement.style.backgroundColor = "blue";  // Blue for a point to Democrats
            keyElement.style.color = "white";
        } else {
            keyElement.style.backgroundColor = "red";   // Red for a point to Republicans
            keyElement.style.color = "white";
        }

        keyElement.innerHTML = `<strong>${key.key}:</strong> ${key.status}`;
        keyElement.style.padding = "10px";
        keyElement.style.margin = "5px 0";
        keyElement.style.borderRadius = "5px";
        keysContainer.appendChild(keyElement);
    });
}

// Election Prediction - Basic Simulation
function calculatePrediction() {
    const positiveKeys = keysStatus.filter(key => key.status === "True").length;
    const prediction = positiveKeys >= 7 ? "Harris" : "Trump";

    // Determine the winner
    const winner = positiveKeys >= 7 ? "Trump" : "Harris";
    const loser = winner === "Trump" ? "Harris" : "Trump";

    // Increase the size of the winner's image
    document.getElementById(winner.toLowerCase()).style.width = "200px";
    document.getElementById(winner.toLowerCase()).style.height = "200px";

    // Keep the loser's image size unchanged
    document.getElementById(loser.toLowerCase()).style.width = "150px";
    document.getElementById(loser.toLowerCase()).style.height = "150px";

    document.getElementById("favoredCandidate").textContent = `(Polls - 1/3) Currently Favored: ${winner}`;

    // Update the keysPrediction text based on the 13 Keys model result
    document.getElementById("keysPrediction").textContent = `(13 Keys - 2/3) Currently Favored: ${prediction}`;
    
    updateHeaderPrediction();
}


// Function to smoothly move images with scroll
function followScroll() {
    const harrisImage = document.getElementById('harris');
    const trumpImage = document.getElementById('trump');

    // Set the base offset positions for images
    const baseOffset = 500;

    // Calculate the new position based on the scroll position
    const scrollY = window.scrollY;

    // Adjust the images' top position gradually
    harrisImage.style.top = `${baseOffset + scrollY * 0.5}px`;
    trumpImage.style.top = `${baseOffset + scrollY * 0.5}px`;
}

// Call followScroll on load to set the initial positions

window.addEventListener('load', followScroll);
window.addEventListener('load', () => {
    const harris = document.getElementById('harris');
    const trump = document.getElementById('trump');

    harris.classList.add('scale-up');
    trump.classList.add('scale-up');

    // Start the float animation after scaling up
    setTimeout(() => {
        harris.style.animation = "float 10s ease-in-out infinite";
        trump.style.animation = "float 10s ease-in-out infinite";
    }, 2000); // Delay matches the scale-up transition
});

// Attach the followScroll function to the window's scroll event
window.addEventListener('scroll', followScroll);

function updateHeaderPrediction() {
    const date = new Date().toLocaleDateString("en-US"); // Get current date in MM/DD/YYYY format
    const positiveKeys = keysStatus.filter(key => key.status === "True").length;
    const prediction = positiveKeys >= 7 ? "Likely Incumbent Win" : "Likely Challenger Win";
    const winner = positiveKeys >= 7 ? "Trump" : "Harris";
    const chance = positiveKeys >= 7 ? "75%" : "65%";
}

// Call this function after calculating the prediction
displayKeysStatus();
calculatePrediction();

// Define weights based on your given breakdown
const weights = {
    fivethirtyEight: 0.30, // 30%
    thirteenKeys: 0.35, // 35%
    economicIndicators: 0.35 // 35%
};

// Sample predictions (for demonstration purposes)
// You would replace these with real-time calculations or dynamically retrieved data
const predictionScores = {
    fivethirtyEight: "Trump", // Replace with the actual polling result
    thirteenKeys: "Harris", // Replace with the 13 Keys result
    economicIndicators: "Harris" // Replace with the Economic Indicator result
};

function calculateWeightedPrediction() {
    let trumpScore = 0;
    let harrisScore = 0;

    // Assign scores based on predictions and weights
    if (predictionScores.fivethirtyEight === "Trump") trumpScore += weights.fivethirtyEight;
    else harrisScore += weights.fivethirtyEight;

    if (predictionScores.thirteenKeys === "Trump") trumpScore += weights.thirteenKeys;
    else harrisScore += weights.thirteenKeys;

    if (predictionScores.economicIndicators === "Trump") trumpScore += weights.economicIndicators;
    else harrisScore += weights.economicIndicators;

    // Calculate margin in percentage points and round to whole number
    const margin = Math.abs(harrisScore - trumpScore) * 10;
    const roundedMargin = Math.round(margin); // Correct rounding for clean display

    // Determine the likely winner and adjust image scaling
    let finalPrediction, resultText;
    if (trumpScore > harrisScore) {
        finalPrediction = `<span style="color: red;">Trump</span>`;
        resultText = `Based on our weighted prediction, the likely winner is: ${finalPrediction} by a margin of ${roundedMargin}%`;
        document.getElementById("trump").style.width = "200px";
        document.getElementById("trump").style.height = "200px";
        document.getElementById("harris").style.width = "150px";
        document.getElementById("harris").style.height = "150px";
    } else {
        finalPrediction = `<span style="color: blue;">Harris</span>`;
        resultText = `Based on our weighted prediction, the likely winner is: ${finalPrediction} by a margin of ${roundedMargin}%`;
        document.getElementById("harris").style.width = "200px";
        document.getElementById("harris").style.height = "200px";
        document.getElementById("trump").style.width = "150px";
        document.getElementById("trump").style.height = "150px";
    }

    // Display the result in the #predictionResult element
    document.getElementById("predictionResult").innerHTML = resultText;
}


// Call the function to display the prediction

calculateThirteenKeysPrediction();
calculateWeightedPrediction();
