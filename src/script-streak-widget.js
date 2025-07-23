document.addEventListener("DOMContentLoaded", () => {
  let streaks = {};

  // Load streaks from localStorage
  function loadStreaks() {
    const savedStreaks = localStorage.getItem("streakData");
    if (savedStreaks) {
      try {
        streaks = JSON.parse(savedStreaks);
        updateWidget();
      } catch (error) {
        console.error("Error loading streaks:", error);
      }
    }
  }

  // Update widget UI
  function updateWidget() {
    const streaksList = document.getElementById("streaksList");
    if (!streaksList) return;

    const streakNames = Object.keys(streaks);
    const today = new Date().toDateString();

    if (streakNames.length === 0) {
      streaksList.innerHTML = `
        <div id="noStreaks" class="text-center text-white text-sm py-4">
          No habits tracked yet
        </div>
      `;
      return;
    }

    streaksList.innerHTML = streakNames
      .map(
        (name) => `
      <div class="flex items-center justify-between p-2 mb-2 rounded" 
           ">
        <div class="flex-1">
          <div class="font-medium text-white text-sm">${name}</div>
          <div class="text-xs text-gray-300">${streaks[name].count} days</div>
        </div>
        <button
          onclick="handleIncrement('${name}')"
          class="px-2 py-1 text-xs rounded transition-colors
          ${
            streaks[name].lastUpdated === today
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700 text-white"
          }"
          ${streaks[name].lastUpdated === today ? "disabled" : ""}
        >
          ${streaks[name].lastUpdated === today ? "✓" : "+1"}
        </button>
      </div>
    `
      )
      .join("");
  }

  // Quick add new streak
  window.quickAddStreak = function () {
    const input = document.getElementById("quickAddInput");
    const name = input.value.trim();

    if (!name) return;

    if (!streaks[name]) {
      streaks[name] = {
        count: 0,
        history: [],
        lastUpdated: null,
      };
      localStorage.setItem("streakData", JSON.stringify(streaks));
      input.value = "";
      updateWidget();
    } else {
      alert("Streak already exists!");
    }
  };

  // Handle Enter key in quick add input
  document.getElementById("quickAddInput").addEventListener("keypress", (e) => {
    if (e.key === "Enter") quickAddStreak();
  });

  // Increment streak
  window.handleIncrement = function (name) {
    const today = new Date().toDateString();
    const streak = streaks[name];

    if (streak.lastUpdated !== today) {
      streaks[name] = {
        count: streak.count + 1,
        history: [...streak.history, streak.count + 1].slice(-30),
        lastUpdated: today,
      };
      localStorage.setItem("streakData", JSON.stringify(streaks));
      updateWidget();
    }
  };

  // Open main app
  window.openMainApp = function () {
    window.open("streakCounter.html", "_blank");
  };

  // Initialize
  loadStreaks();
  setInterval(loadStreaks, 30000); // Sync every 30 seconds
  window.addEventListener("storage", () => loadStreaks()); // Sync across tabs
});
