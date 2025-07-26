let sampleGoals = [
  {
    id: 1,
    name: "Learn JavaScript",
    progress: 75,
    subjects: [
      { name: "Variables & Functions", completed: true },
      { name: "DOM Manipulation", completed: true },
      { name: "Async Programming", completed: false },
    ],
  },
  {
    id: 2,
    name: "Master React",
    progress: 40,
    subjects: [
      { name: "Components", completed: true },
      { name: "State & Props", completed: false },
      { name: "Hooks", completed: false },
    ],
  },
  {
    id: 3,
    name: "Data Structures",
    progress: 15,
    subjects: [
      { name: "Arrays", completed: true },
      { name: "Linked Lists", completed: false },
      { name: "Trees", completed: false },
    ],
  },
];

// Motivational messages based on progress percentage
function getMotivationalMessage(progress) {
  if (progress === 0) {
    return {
      message: "Every journey begins with a single step! 🚀",
      emoji: "🌱",
      color: "text-blue-600",
    };
  } else if (progress > 0 && progress <= 10) {
    return {
      message: "Great start! Keep the momentum going! 💪",
      emoji: "🔥",
      color: "text-orange-600",
    };
  } else if (progress > 10 && progress <= 25) {
    return {
      message: "You're building solid foundations! 🏗️",
      emoji: "⭐",
      color: "text-yellow-600",
    };
  } else if (progress > 25 && progress <= 50) {
    return {
      message: "Halfway there! Your dedication is showing! 🎯",
      emoji: "🚀",
      color: "text-purple-600",
    };
  } else if (progress > 50 && progress <= 75) {
    return {
      message: "Excellent progress! You're in the zone! ⚡",
      emoji: "🔥",
      color: "text-orange-600",
    };
  } else if (progress > 75 && progress <= 90) {
    return {
      message: "Almost there! The finish line is in sight! 🏁",
      emoji: "🎖️",
      color: "text-green-600",
    };
  } else if (progress > 90 && progress < 100) {
    return {
      message: "So close! Give it that final push! 💎",
      emoji: "👑",
      color: "text-indigo-600",
    };
  } else {
    return {
      message: "Congratulations! Goal achieved! 🎉",
      emoji: "🏆",
      color: "text-green-600",
    };
  }
}

// Get progress bar color based on percentage
function getProgressBarColor(progress) {
  if (progress <= 25) return "bg-red-500";
  if (progress <= 50) return "bg-yellow-500";
  if (progress <= 75) return "bg-blue-500";
  return "bg-green-500";
}

// Load goals from localStorage (fallback to sample data)
function loadGoals() {
  try {
    const storedGoals = localStorage.getItem("progressGoals");
    if (storedGoals) {
      const parsedGoals = JSON.parse(storedGoals);
      // Calculate progress for each goal if not already calculated
      return parsedGoals.map((goal) => {
        if (goal.progress === undefined) {
          goal.progress = calculateGoalProgress(goal);
        }
        return goal;
      });
    }
  } catch (error) {
    console.log("Error loading goals from localStorage:", error);
  }
  return sampleGoals;
}

// Calculate progress for a goal based on completed tasks
function calculateGoalProgress(goal) {
  if (!goal.subjects || goal.subjects.length === 0) return 0;

  let totalTasks = 0;
  let completedTasks = 0;

  goal.subjects.forEach((subject) => {
    if (subject.chapters) {
      subject.chapters.forEach((chapter) => {
        totalTasks++;
        if (chapter.completed) completedTasks++;

        // Count sub-items for chapters only
        if (chapter.type === "chapter" && chapter.subItems) {
          totalTasks += chapter.subItems.length;
          completedTasks += chapter.subItems.filter(
            (item) => item.completed
          ).length;
        }
      });
    } else {
      // Simple subject structure
      totalTasks++;
      if (subject.completed) completedTasks++;
    }
  });

  return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
}

// Render the progress tracker widget
function renderProgressWidget() {
  const goals = loadGoals();
  const widget = document.getElementById("progressTrackerWidget");

  if (goals.length === 0) {
    widget.innerHTML = `
                    <div class="text-center py-6">
                        <div class="text-4xl mb-2">📚</div>
                        <p class="text-gray-600 text-sm">No goals yet</p>
                        <p class="text-xs text-gray-500 mt-1">Create your first goal to start tracking!</p>
                    </div>
                `;
    return;
  }

  // Get the first active goal (you can modify this logic as needed)
  const activeGoal = goals.find((goal) => goal.progress < 100) || goals[0];
  const motivation = getMotivationalMessage(activeGoal.progress);
  const progressBarColor = getProgressBarColor(activeGoal.progress);

  widget.innerHTML = `
                <!-- Active Goal -->
                <div class="space-y-3">
                    <!-- Goal Header -->
                    <div class="flex items-center justify-between">
                        <h2 class="text-lg font-semibold text-gray-800 truncate" title="${
                          activeGoal.name
                        }">
                            ${
                              activeGoal.name.length > 20
                                ? activeGoal.name.substring(0, 20) + "..."
                                : activeGoal.name
                            }
                        </h2>
                        <span class="text-2xl font-bold ${motivation.color}">${
    activeGoal.progress
  }%</span>
                    </div>

                    <!-- Progress Bar -->
                    <div class="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div class="${progressBarColor} h-3 rounded-full transition-all duration-500 ease-out" 
                             style="width: ${activeGoal.progress}%"></div>
                    </div>

                    <!-- Motivational Message -->
                    <div class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 border-l-4 border-blue-400">
                        <div class="flex items-center space-x-2">
                            <span class="text-xl">${motivation.emoji}</span>
                            <p class="text-sm ${
                              motivation.color
                            } font-medium">${motivation.message}</p>
                        </div>
                    </div>

                    <!-- Quick Stats -->
                    <div class="grid grid-cols-2 gap-2 mt-3">
                        <div class="bg-white/50 rounded-lg p-2 text-center">
                            <div class="text-xs text-gray-600">Active Goals</div>
                            <div class="text-lg font-bold text-blue-600">${
                              goals.filter((g) => g.progress < 100).length
                            }</div>
                        </div>
                        <div class="bg-white/50 rounded-lg p-2 text-center">
                            <div class="text-xs text-gray-600">Completed</div>
                            <div class="text-lg font-bold text-green-600">${
                              goals.filter((g) => g.progress >= 100).length
                            }</div>
                        </div>
                    </div>

                    <!-- Other Goals Preview -->
                    ${
                      goals.length > 1
                        ? `
                        <div class="mt-3">
                            <div class="text-xs text-gray-600 mb-2">Other Goals:</div>
                            <div class="space-y-1">
                                ${goals
                                  .filter((g) => g.id !== activeGoal.id)
                                  .slice(0, 2)
                                  .map(
                                    (goal) => `
                                    <div class="flex items-center justify-between text-xs bg-white/30 rounded p-2">
                                        <span class="truncate" title="${
                                          goal.name
                                        }">
                                            ${
                                              goal.name.length > 15
                                                ? goal.name.substring(0, 15) +
                                                  "..."
                                                : goal.name
                                            }
                                        </span>
                                        <span class="font-medium ${
                                          goal.progress >= 100
                                            ? "text-green-600"
                                            : "text-gray-600"
                                        }">
                                            ${goal.progress}%
                                        </span>
                                    </div>
                                `
                                  )
                                  .join("")}
                                ${
                                  goals.length > 3
                                    ? `
                                    <div class="text-xs text-gray-500 text-center">
                                        +${goals.length - 3} more goals
                                    </div>
                                `
                                    : ""
                                }
                            </div>
                        </div>
                    `
                        : ""
                    }
                </div>
            `;
}

// Update widget every 30 seconds to sync with main app
function startAutoUpdate() {
  setInterval(renderProgressWidget, 30000);
}

// Initialize widget
document.addEventListener("DOMContentLoaded", function () {
  renderProgressWidget();
  startAutoUpdate();
});

// Add click handler for goal name to show more details
document.addEventListener("click", function (e) {
  if (e.target.classList.contains("goal-name")) {
    const goalName = e.target.getAttribute("data-goal-name");
    alert(`Goal: ${goalName}\nClick "Open in App" to view full details!`);
  }
});
