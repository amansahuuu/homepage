// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  // Check if Chart.js is loaded
  if (typeof Chart === "undefined") {
    console.error("Chart.js is not loaded");
    return;
  }

  // Initial render
  renderChart();
  updateAverage();
});

// Submit motivation data
function submitMotivation() {
  const scoreInput = document.getElementById("motivationInput");
  const noteInput = document.getElementById("motivationNote");
  const averageContainer = document.getElementById("averageContainer");

  const score = parseInt(scoreInput.value);
  const note = noteInput.value.trim();
  const date = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  // Validation
  if (isNaN(score)) {
    alert("Please enter a number");
    return;
  }
  if (score < 1 || score > 5) {
    alert("Please enter a score between 1 and 5");
    return;
  }

  const newEntry = { date, score, note };

  // Get existing data from localStorage
  let motivationData = JSON.parse(localStorage.getItem("motivationData")) || [];

  // Check if entry already exists for this date
  const existingIndex = motivationData.findIndex(
    (entry) => entry.date === date
  );
  if (existingIndex !== -1) {
    // Update existing entry
    motivationData[existingIndex] = newEntry;
  } else {
    // Add new entry
    motivationData.push(newEntry);
  }

  // Sort by date (newest first)
  motivationData.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Save to localStorage
  localStorage.setItem("motivationData", JSON.stringify(motivationData));

  // Clear inputs
  scoreInput.value = "";
  noteInput.value = "";

  // Show average container
  averageContainer.classList.remove("hidden");

  // Update UI
  renderChart();
  updateAverage();

  // Show success feedback
  const submitBtn = document.querySelector(
    'button[onclick="submitMotivation()"]'
  );
  submitBtn.textContent = "Submitted!";
  submitBtn.classList.remove("bg-blue-600", "hover:bg-blue-700");
  submitBtn.classList.add("bg-green-600", "hover:bg-green-700");

  setTimeout(() => {
    submitBtn.textContent = "Submit";
    submitBtn.classList.remove("bg-green-600", "hover:bg-green-700");
    submitBtn.classList.add("bg-blue-600", "hover:bg-blue-700");
  }, 2000);
}

// Render chart using Chart.js
function renderChart() {
  const filterSelect = document.getElementById("filterSelect");
  const filterValue = filterSelect.value;
  const motivationData =
    JSON.parse(localStorage.getItem("motivationData")) || [];
  const chartContainer = document.getElementById("motivationWidget");

  // Filter data based on selection
  let filteredData = [...motivationData];
  const now = new Date();

  if (filterValue === "week") {
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    filteredData = filteredData.filter(
      (entry) => new Date(entry.date) >= oneWeekAgo
    );
  } else if (filterValue === "month") {
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    filteredData = filteredData.filter(
      (entry) => new Date(entry.date) >= oneMonthAgo
    );
  }

  // Sort by date (oldest first for chart)
  filteredData.sort((a, b) => new Date(a.date) - new Date(b.date));

  // Check if canvas exists
  let canvas = document.getElementById("motivationChart");

  if (!canvas) {
    // Create canvas if it doesn't exist
    canvas = document.createElement("canvas");
    canvas.id = "motivationChart";
    canvas.height = 300;
    chartContainer.appendChild(canvas);
  }

  // Destroy previous chart instance if it exists
  if (window.motivationChart) {
    window.motivationChart.destroy();
  }

  // Prepare data for chart
  const dates = filteredData.map((entry) => {
    const dateObj = new Date(entry.date);
    return dateObj.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  });

  const scores = filteredData.map((entry) => entry.score);
  const notes = filteredData.map((entry) => entry.note);

  // Create chart
  const ctx = canvas.getContext("2d");
  window.motivationChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: dates,
      datasets: [
        {
          label: "Motivation Score",
          data: scores,
          backgroundColor: "rgba(59, 130, 246, 0.2)",
          borderColor: "rgba(59, 130, 246, 1)",
          borderWidth: 2,
          pointBackgroundColor: "rgba(59, 130, 246, 1)",
          pointRadius: 5,
          pointHoverRadius: 7,
          tension: 0.1,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: false,
          min: 1,
          max: 5,
          ticks: {
            stepSize: 1,
          },
          grid: {
            color: "rgba(0, 0, 0, 0.05)",
          },
        },
        x: {
          grid: {
            display: false,
          },
        },
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            afterLabel: function (context) {
              const index = context.dataIndex;
              const note = filteredData[index].note;
              return note ? `Note: ${note}` : "";
            },
          },
        },
      },
    },
  });
}

// Update average display
function updateAverage() {
  const averageContainer = document.getElementById("averageContainer");
  const motivationData =
    JSON.parse(localStorage.getItem("motivationData")) || [];

  if (motivationData.length === 0) {
    averageContainer.textContent = "No data yet";
    return;
  }

  const total = motivationData.reduce((sum, entry) => sum + entry.score, 0);
  const average = total / motivationData.length;

  // Create emoji based on average
  let emoji = "";
  if (average >= 4) emoji = "😊";
  else if (average >= 3) emoji = "🙂";
  else if (average >= 2) emoji = "😐";
  else emoji = "😞";

  averageContainer.innerHTML = `
        Your average motivation: <span class="text-2xl">${average.toFixed(
          1
        )}/5 ${emoji}</span>
    `;
}

// Export data to JSON file
function exportData() {
  const motivationData =
    JSON.parse(localStorage.getItem("motivationData")) || [];

  if (motivationData.length === 0) {
    alert("No data to export");
    return;
  }

  // Create export data with metadata
  const exportData = {
    metadata: {
      exportedAt: new Date().toISOString(),
      totalEntries: motivationData.length,
      average:
        motivationData.reduce((sum, entry) => sum + entry.score, 0) /
        motivationData.length,
    },
    entries: motivationData,
  };

  // Create download link
  const dataStr = JSON.stringify(exportData, null, 2);
  const dataBlob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(dataBlob);

  const exportBtn = document.querySelector('button[onclick="exportData()"]');
  exportBtn.textContent = "Exporting...";

  setTimeout(() => {
    const link = document.createElement("a");
    link.href = url;
    link.download = `motivation_data_${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    exportBtn.textContent = "Exported!";
    setTimeout(() => {
      exportBtn.textContent = "Export";
    }, 2000);
  }, 500);
}

// Import data from file
function importData(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const importedData = JSON.parse(e.target.result);
      let entries = [];

      // Handle different import formats
      if (Array.isArray(importedData)) {
        entries = importedData;
      } else if (importedData.entries && Array.isArray(importedData.entries)) {
        entries = importedData.entries;
      } else {
        throw new Error("Invalid file format");
      }

      // Validate entries
      const validEntries = entries.filter(
        (entry) =>
          entry.date &&
          typeof entry.score === "number" &&
          entry.score >= 1 &&
          entry.score <= 5
      );

      if (validEntries.length === 0) {
        throw new Error("No valid entries found in file");
      }

      // Get current data
      let currentData =
        JSON.parse(localStorage.getItem("motivationData")) || [];

      // Merge data (avoid duplicates)
      const existingDates = new Set(currentData.map((entry) => entry.date));
      const newEntries = validEntries.filter(
        (entry) => !existingDates.has(entry.date)
      );

      if (newEntries.length === 0) {
        alert("All entries in the file already exist in your data");
        return;
      }

      // Combine data
      const combinedData = [...currentData, ...newEntries];

      // Save to localStorage
      localStorage.setItem("motivationData", JSON.stringify(combinedData));

      // Update UI
      renderChart();
      updateAverage();

      alert(`Successfully imported ${newEntries.length} new entries`);
    } catch (error) {
      console.error("Import error:", error);
      alert("Error importing data: " + error.message);
    }

    // Reset file input
    event.target.value = "";
  };

  reader.readAsText(file);
}

// Export chart as image
function exportChartAsImage() {
  const canvas = document.getElementById("motivationChart");
  if (!canvas) {
    alert("No chart to export");
    return;
  }

  // Create download link
  const link = document.createElement("a");
  link.download = `motivation_chart_${
    new Date().toISOString().split("T")[0]
  }.png`;
  link.href = canvas.toDataURL("image/png");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
