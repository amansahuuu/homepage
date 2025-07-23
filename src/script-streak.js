let streaks = {};
let selectedStreak = "";

// Load streaks from localStorage on page load
function loadStreaks() {
  const savedStreaks = localStorage.getItem("streakData");
  if (savedStreaks) {
    try {
      streaks = JSON.parse(savedStreaks);
      if (Object.keys(streaks).length > 0 && !selectedStreak) {
        selectedStreak = Object.keys(streaks)[0];
      }
      updateDisplay();
    } catch (error) {
      console.error("Error loading streak data:", error);
    }
  }
}

// Save streaks to localStorage
function saveStreaks() {
  if (Object.keys(streaks).length > 0) {
    localStorage.setItem("streakData", JSON.stringify(streaks));
  }
}

// Add new streak
function addStreak() {
  const input = document.getElementById("newStreakInput");
  const name = input.value.trim();

  if (name && !streaks[name]) {
    streaks[name] = {
      count: 0,
      history: [],
      lastUpdated: null,
    };
    selectedStreak = name;
    input.value = "";
    saveStreaks();
    updateDisplay();
  }
}

// Select streak
function selectStreak(name) {
  selectedStreak = name;
  updateDisplay();
}

// Increment streak
function incrementStreak() {
  const today = new Date().toDateString();
  const streak = streaks[selectedStreak];

  if (streak.lastUpdated !== today) {
    const newHistory = [...streak.history];
    if (newHistory.length >= 30) {
      newHistory.shift();
    }
    newHistory.push(streak.count + 1);

    streaks[selectedStreak] = {
      count: streak.count + 1,
      history: newHistory,
      lastUpdated: today,
    };
    saveStreaks();
    updateDisplay();
  }
}

// Reset streak
function resetStreak() {
  streaks[selectedStreak] = {
    count: 0,
    history: [],
    lastUpdated: null,
  };
  saveStreaks();
  updateDisplay();
}

// Delete streak
function deleteStreak() {
  delete streaks[selectedStreak];
  const streakNames = Object.keys(streaks);
  selectedStreak = streakNames.length > 0 ? streakNames[0] : "";
  saveStreaks();
  updateDisplay();
}

// Update display
function updateDisplay() {
  updateStreakSelector();
  updateCurrentStreak();
  updateGraph();
  updateStreakList();
}

// Update streak selector
function updateStreakSelector() {
  const selector = document.getElementById("streakSelector");
  const select = document.getElementById("streakSelect");

  if (Object.keys(streaks).length > 0) {
    selector.classList.remove("hidden");
    select.innerHTML = "";
    Object.keys(streaks).forEach((name) => {
      const option = document.createElement("option");
      option.value = name;
      option.textContent = name;
      if (name === selectedStreak) option.selected = true;
      select.appendChild(option);
    });
  } else {
    selector.classList.add("hidden");
  }
}

// Update current streak display
function updateCurrentStreak() {
  const currentStreakDiv = document.getElementById("currentStreak");
  const streakName = document.getElementById("streakName");
  const streakCount = document.getElementById("streakCount");
  const incrementBtn = document.getElementById("incrementBtn");

  if (selectedStreak && streaks[selectedStreak]) {
    currentStreakDiv.classList.remove("hidden");
    streakName.textContent = selectedStreak;
    streakCount.textContent = streaks[selectedStreak].count;

    // Disable increment button if already updated today
    const today = new Date().toDateString();
    if (streaks[selectedStreak].lastUpdated === today) {
      incrementBtn.disabled = true;
      incrementBtn.classList.add("opacity-50", "cursor-not-allowed");
    } else {
      incrementBtn.disabled = false;
      incrementBtn.classList.remove("opacity-50", "cursor-not-allowed");
    }
  } else {
    currentStreakDiv.classList.add("hidden");
  }
}

// Update graph
function updateGraph() {
  const graph = document.getElementById("graph");

  if (
    !selectedStreak ||
    !streaks[selectedStreak] ||
    streaks[selectedStreak].history.length === 0
  ) {
    graph.innerHTML = `
                    <div class="w-full h-full flex items-center justify-center">
                        <span class="text-gray-500">No data to display</span>
                    </div>
                `;
    return;
  }

  const history = streaks[selectedStreak].history;
  const maxValue = Math.max(...history, 1);
  const barWidth = Math.max(12, Math.floor(480 / Math.max(history.length, 1)));

  let barsHtml = "";
  history.forEach((value, index) => {
    const height = Math.max(4, (value / maxValue) * 152);
    barsHtml += `
                    <div 
                        class="bg-gray-600 rounded-t-sm flex-shrink-0" 
                        style="height: ${height}px; width: ${barWidth}px;"
                        title="Day ${index + 1}: ${value}"
                    ></div>
                `;
  });

  graph.innerHTML = `
                <div class="w-full h-full flex items-end justify-center space-x-1">
                    ${barsHtml}
                </div>
            `;
}

// Update streak list
function updateStreakList() {
  const streakList = document.getElementById("streakList");
  const streakItems = document.getElementById("streakItems");

  if (Object.keys(streaks).length > 0) {
    streakList.classList.remove("hidden");
    streakItems.innerHTML = "";

    Object.entries(streaks).forEach(([name, data]) => {
      const item = document.createElement("div");
      item.className = "p-3 rounded-lg";
      item.style.cssText =
        "backdrop-filter: blur(4px); background-color: rgba(255, 255, 255, 0.3); box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);";
      item.innerHTML = `
                        <div class="flex justify-between items-center">
                            <span class="font-medium text-gray-800">${name}</span>
                            <span class="text-xl font-bold text-gray-700">${data.count}</span>
                        </div>
                    `;
      streakItems.appendChild(item);
    });
  } else {
    streakList.classList.add("hidden");
  }
}

// Handle Enter key in input
document
  .getElementById("newStreakInput")
  .addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      addStreak();
    }
  });

// Load streaks when page loads
window.onload = loadStreaks;
