let goals = JSON.parse(localStorage.getItem("progressGoals")) || [];
let completedGoals = JSON.parse(localStorage.getItem("completedGoals")) || [];
let masterPassword = localStorage.getItem("masterPassword") || null;
let currentTask = null;
let currentDropdownChapter = null;
let confirmCallback = null;
let currentTheme = JSON.parse(localStorage.getItem("currentTheme")) || null;
let backgroundImage = localStorage.getItem("backgroundImage") || null;
let bgOpacity = localStorage.getItem("bgOpacity") || 70;

// Theme system
const themes = {
  ancient: {
    bgPrimary: "#f5f1e8",
    bgSecondary: "#faf7f0",
    bgTertiary: "#f0ede0",
    textPrimary: "#2d1810",
    textSecondary: "#8b6914",
    accentPrimary: "#cc2936",
    accentSecondary: "#4a6741",
    accentTertiary: "#d4af37",
    borderColor: "#8b6914",
  },
  ocean: {
    bgPrimary: "#e6f3ff",
    bgSecondary: "#f0f8ff",
    bgTertiary: "#dbeafe",
    textPrimary: "#1e3a8a",
    textSecondary: "#1e40af",
    accentPrimary: "#dc2626",
    accentSecondary: "#059669",
    accentTertiary: "#0891b2",
    borderColor: "#3b82f6",
  },
  forest: {
    bgPrimary: "#ecfdf5",
    bgSecondary: "#f0fdf4",
    bgTertiary: "#dcfce7",
    textPrimary: "#14532d",
    textSecondary: "#166534",
    accentPrimary: "#dc2626",
    accentSecondary: "#16a34a",
    accentTertiary: "#ca8a04",
    borderColor: "#22c55e",
  },
  sunset: {
    bgPrimary: "#fff7ed",
    bgSecondary: "#ffedd5",
    bgTertiary: "#fed7aa",
    textPrimary: "#9a3412",
    textSecondary: "#c2410c",
    accentPrimary: "#dc2626",
    accentSecondary: "#ea580c",
    accentTertiary: "#f59e0b",
    borderColor: "#f97316",
  },
  minimal: {
    bgPrimary: "#ffffff",
    bgSecondary: "#f9fafb",
    bgTertiary: "#f3f4f6",
    textPrimary: "#111827",
    textSecondary: "#374151",
    accentPrimary: "#dc2626",
    accentSecondary: "#059669",
    accentTertiary: "#0891b2",
    borderColor: "#d1d5db",
  },
  dark: {
    bgPrimary: "#1f2937",
    bgSecondary: "#111827",
    bgTertiary: "#374151",
    textPrimary: "#f9fafb",
    textSecondary: "#d1d5db",
    accentPrimary: "#ef4444",
    accentSecondary: "#10b981",
    accentTertiary: "#f59e0b",
    borderColor: "#6b7280",
  },
};

function applyTheme(themeName) {
  const theme = themes[themeName];
  if (!theme) return;

  const root = document.documentElement;
  Object.entries(theme).forEach(([key, value]) => {
    const cssVar = "--" + key.replace(/([A-Z])/g, "-$1").toLowerCase();
    root.style.setProperty(cssVar, value);
  });

  // Remove user background if applying predefined theme
  const body = document.getElementById("mainBody");
  body.classList.remove("user-bg");
  body.style.backgroundImage = "";

  currentTheme = { type: "predefined", name: themeName };
  localStorage.setItem("currentTheme", JSON.stringify(currentTheme));
  localStorage.removeItem("backgroundImage");
}

function extractColorsFromImage(imageElement) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = imageElement.width;
  canvas.height = imageElement.height;

  ctx.drawImage(imageElement, 0, 0);

  // Sample colors from different areas
  const samples = [
    ctx.getImageData(0, 0, 1, 1).data,
    ctx.getImageData(canvas.width / 2, canvas.height / 2, 1, 1).data,
    ctx.getImageData(canvas.width - 1, canvas.height - 1, 1, 1).data,
    ctx.getImageData(0, canvas.height - 1, 1, 1).data,
    ctx.getImageData(canvas.width - 1, 0, 1, 1).data,
  ];

  // Convert to hex and create theme
  const colors = samples.map((rgba) => {
    return (
      "#" +
      [rgba[0], rgba[1], rgba[2]]
        .map((x) => {
          const hex = x.toString(16);
          return hex.length === 1 ? "0" + hex : hex;
        })
        .join("")
    );
  });

  return {
    bgPrimary: lightenColor(colors[0], 0.9),
    bgSecondary: lightenColor(colors[1], 0.95),
    bgTertiary: lightenColor(colors[2], 0.85),
    textPrimary: darkenColor(colors[0], 0.8),
    textSecondary: darkenColor(colors[1], 0.6),
    accentPrimary: colors[3],
    accentSecondary: colors[4],
    accentTertiary: colors[2],
    borderColor: colors[1],
  };
}

function lightenColor(hex, factor) {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(
    255,
    Math.floor((num >> 16) + (255 - (num >> 16)) * factor)
  );
  const g = Math.min(
    255,
    Math.floor(((num >> 8) & 0x00ff) + (255 - ((num >> 8) & 0x00ff)) * factor)
  );
  const b = Math.min(
    255,
    Math.floor((num & 0x0000ff) + (255 - (num & 0x0000ff)) * factor)
  );
  return "#" + ((r << 16) | (g << 8) | b).toString(16).padStart(6, "0");
}

function darkenColor(hex, factor) {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.floor((num >> 16) * factor);
  const g = Math.floor(((num >> 8) & 0x00ff) * factor);
  const b = Math.floor((num & 0x0000ff) * factor);
  return "#" + ((r << 16) | (g << 8) | b).toString(16).padStart(6, "0");
}

function handleImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const img = new Image();
    img.onload = function () {
      // Apply image as background
      const body = document.getElementById("mainBody");
      body.style.backgroundImage = `url(${e.target.result})`;
      body.classList.add("user-bg");

      // Extract and apply colors
      const extractedTheme = extractColorsFromImage(img);
      const root = document.documentElement;
      Object.entries(extractedTheme).forEach(([key, value]) => {
        const cssVar = "--" + key.replace(/([A-Z])/g, "-$1").toLowerCase();
        root.style.setProperty(cssVar, value);
      });

      // Save to localStorage
      backgroundImage = e.target.result;
      currentTheme = { type: "custom", colors: extractedTheme };
      localStorage.setItem("backgroundImage", backgroundImage);
      localStorage.setItem("currentTheme", JSON.stringify(currentTheme));

      showAlert(
        "Theme Applied",
        "Your custom theme has been applied successfully!",
        "success"
      );
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function updateOpacity(value) {
  bgOpacity = value;
  localStorage.setItem("bgOpacity", bgOpacity);

  // Update all backdrop elements
  const backdropElements = document.querySelectorAll(".backdrop-filter");
  backdropElements.forEach((el) => {
    el.style.setProperty("--tw-bg-opacity", value / 100);
  });
}

function showThemeModal() {
  document.getElementById("themeModal").classList.remove("hidden");
}

function closeThemeModal() {
  document.getElementById("themeModal").classList.add("hidden");
}

function resetTheme() {
  applyTheme("ancient");
  const body = document.getElementById("mainBody");
  body.classList.remove("user-bg");
  body.style.backgroundImage = "";

  localStorage.removeItem("backgroundImage");
  localStorage.removeItem("currentTheme");

  showAlert("Theme Reset", "Theme has been reset to default.", "success");
}

// Initialize theme on load
function initializeTheme() {
  if (currentTheme) {
    if (currentTheme.type === "predefined") {
      applyTheme(currentTheme.name);
    } else if (currentTheme.type === "custom" && backgroundImage) {
      const body = document.getElementById("mainBody");
      body.style.backgroundImage = `url(${backgroundImage})`;
      body.classList.add("user-bg");

      const root = document.documentElement;
      Object.entries(currentTheme.colors).forEach(([key, value]) => {
        const cssVar = "--" + key.replace(/([A-Z])/g, "-$1").toLowerCase();
        root.style.setProperty(cssVar, value);
      });
    }
  }

  // Apply saved opacity
  updateOpacity(bgOpacity);
  document.getElementById("bgOpacity").value = bgOpacity;
}

// Custom Alert System
function showAlert(title, message, type = "info") {
  const alertModal = document.getElementById("customAlert");
  const alertTitle = document.getElementById("alertTitle");
  const alertMessage = document.getElementById("alertMessage");
  const alertIcon = document.getElementById("alertIcon");

  alertTitle.textContent = title;
  alertMessage.textContent = message;

  // Set icon and color based on type
  switch (type) {
    case "error":
      alertIcon.textContent = "❌";
      alertTitle.className = "text-md font-bold text-red-600";
      break;
    case "success":
      alertIcon.textContent = "✅";
      alertTitle.className = "text-md font-bold text-green-600";
      break;
    case "warning":
      alertIcon.textContent = "⚠️";
      alertTitle.className = "text-md font-bold text-yellow-600";
      break;
    default:
      alertIcon.textContent = "ℹ️";
      alertTitle.className = "text-md font-bold text-blue-600";
  }

  alertModal.classList.remove("hidden");
}

function closeCustomAlert() {
  document.getElementById("customAlert").classList.add("hidden");
}

function showConfirm(message, callback) {
  const confirmModal = document.getElementById("customConfirm");
  const confirmMessage = document.getElementById("confirmMessage");

  confirmMessage.textContent = message;
  confirmCallback = callback;
  confirmModal.classList.remove("hidden");
}

function closeCustomConfirm(result) {
  document.getElementById("customConfirm").classList.add("hidden");
  if (confirmCallback) {
    confirmCallback(result);
    confirmCallback = null;
  }
}

function saveToLocalStorage() {
  localStorage.setItem("progressGoals", JSON.stringify(goals));
  localStorage.setItem("completedGoals", JSON.stringify(completedGoals));
  if (masterPassword) {
    localStorage.setItem("masterPassword", masterPassword);
  }
}

function showGoalCreation() {
  document.getElementById("goalCreationPanel").classList.remove("hidden");
}

function hideGoalCreation() {
  document.getElementById("goalCreationPanel").classList.add("hidden");
  resetForm();
}

function showPasswordSetup() {
  document.getElementById("passwordSetupModal").classList.remove("hidden");
}

function closePasswordSetup() {
  document.getElementById("passwordSetupModal").classList.add("hidden");
  document.getElementById("newPassword").value = "";
  document.getElementById("confirmNewPassword").value = "";
}

function savePassword() {
  const newPassword = document.getElementById("newPassword").value;
  const confirmPassword = document.getElementById("confirmNewPassword").value;

  if (!newPassword || newPassword.length < 4) {
    showAlert(
      "Invalid Password",
      "Password must be at least 4 characters long",
      "error"
    );
    return;
  }

  if (newPassword !== confirmPassword) {
    showAlert("Password Mismatch", "Passwords do not match", "error");
    return;
  }

  masterPassword = newPassword;
  saveToLocalStorage();
  closePasswordSetup();
  showAlert("Success", "Password saved successfully!", "success");
}

function createSubjectInputs() {
  const totalSubjects = parseInt(
    document.getElementById("totalSubjects").value
  );
  const goalName = document.getElementById("goalName").value.trim();

  if (!goalName || !totalSubjects || totalSubjects < 1) {
    showAlert(
      "Invalid Input",
      "Please enter a valid goal name and number of subjects",
      "error"
    );
    return;
  }

  const subjectsList = document.getElementById("subjectsList");
  subjectsList.innerHTML = "";

  for (let i = 0; i < totalSubjects; i++) {
    const subjectDiv = document.createElement("div");
    subjectDiv.className =
      "space-y-2 p-2 bg-white bg-opacity-70 rounded border border-gray-300";
    subjectDiv.innerHTML = `
                    <h4 class="font-semibold text-sm" style="color: var(--text-secondary)">Subject ${
                      i + 1
                    }</h4>
                    <input type="text" id="subject_${i}_name" placeholder="Subject Name" class="w-full p-1 bg-white bg-opacity-90 rounded border border-gray-200 focus:border-gray-500 focus:outline-none text-sm">
                    <input type="number" id="subject_${i}_chapters" placeholder="Number of Chapters" min="1" class="w-full p-1 bg-white bg-opacity-90 rounded border border-gray-200 focus:border-gray-500 focus:outline-none text-sm">
                    <div id="subject_${i}_subItems" class="space-y-1"></div>
                    <button onclick="addSubItemsTextarea(${i})" type="button" class="w-full text-white font-bold py-1 px-2 rounded transition duration-200 text-xs" style="background-color: var(--accent-primary)">
                        Add Sub-Items
                    </button>
                `;
    subjectsList.appendChild(subjectDiv);
  }

  document.getElementById("subjectInputs").classList.remove("hidden");
}

function addSubItemsTextarea(subjectIndex) {
  const chapters = parseInt(
    document.getElementById(`subject_${subjectIndex}_chapters`).value
  );
  if (!chapters || chapters < 1) {
    showAlert(
      "Invalid Input",
      "Please enter a valid number of chapters",
      "error"
    );
    return;
  }

  const subItemsDiv = document.getElementById(
    `subject_${subjectIndex}_subItems`
  );
  subItemsDiv.innerHTML = "";

  for (let i = 0; i < chapters; i++) {
    const chapterDiv = document.createElement("div");
    chapterDiv.className =
      "bg-gray-50 bg-opacity-70 p-2 rounded border border-gray-200";
    chapterDiv.innerHTML = `
                    <h5 class="text-xs font-medium mb-1" style="color: var(--text-secondary)">Chapter ${
                      i + 1
                    } Sub-Items</h5>
                    <textarea id="subject_${subjectIndex}_chapter_${i}_subItems" placeholder="Enter sub-items separated by commas" 
                              class="w-full p-1 bg-white bg-opacity-90 rounded border border-gray-200 focus:border-gray-500 focus:outline-none text-xs h-12 resize-none"></textarea>
                `;
    subItemsDiv.appendChild(chapterDiv);
    break;
  }
}

function createGoal() {
  if (!masterPassword) {
    showAlert(
      "Password Required",
      "Please set a master password first",
      "warning"
    );
    showPasswordSetup();
    return;
  }

  const goalName = document.getElementById("goalName").value.trim();
  const totalSubjects = parseInt(
    document.getElementById("totalSubjects").value
  );

  if (!goalName || !totalSubjects) {
    showAlert("Incomplete Form", "Please fill in all required fields", "error");
    return;
  }

  const subjects = [];
  for (let i = 0; i < totalSubjects; i++) {
    const subjectName = document
      .getElementById(`subject_${i}_name`)
      .value.trim();
    const chapters = parseInt(
      document.getElementById(`subject_${i}_chapters`).value
    );

    if (!subjectName || !chapters) {
      showAlert(
        "Incomplete Subject",
        `Please fill in all details for Subject ${i + 1}`,
        "error"
      );
      return;
    }

    const chapterData = [];
    for (let j = 0; j < chapters; j++) {
      const subItemsInput = document.getElementById(
        `subject_${i}_chapter_${j}_subItems`
      );
      const subItems = subItemsInput
        ? subItemsInput.value
            .split(",")
            .map((item) => item.trim())
            .filter((item) => item)
        : [];

      // Add chapter
      chapterData.push({
        id: `${i}_${j}_chapter`,
        name: `Chapter ${j + 1}`,
        type: "chapter",
        completed: false,
        subItems: subItems.map((item, index) => ({
          id: `${i}_${j}_sub_${index}`,
          name: item,
          completed: false,
        })),
      });

      // Add revision (only if it's not the first chapter)
      if (j > 0) {
        chapterData.push({
          id: `${i}_${j}_revision`,
          name: `Revision Ch. 1-${j + 1}`,
          type: "revision",
          completed: false,
          subItems: [],
        });
      }
    }

    subjects.push({
      id: i,
      name: subjectName,
      chapters: chapterData,
    });
  }

  const newGoal = {
    id: Date.now(),
    name: goalName,
    subjects: subjects,
    progress: 0,
    created: new Date().toISOString(),
  };

  goals.push(newGoal);
  saveToLocalStorage();
  renderActiveGoals();
  hideGoalCreation();
  showAlert(
    "Goal Created",
    "Your new goal has been created successfully!",
    "success"
  );
}

function resetForm() {
  document.getElementById("goalName").value = "";
  document.getElementById("totalSubjects").value = "";
  document.getElementById("subjectInputs").classList.add("hidden");
  document.getElementById("subjectsList").innerHTML = "";
}

function calculateProgress(goal) {
  let totalTasks = 0;
  let completedTasks = 0;

  goal.subjects.forEach((subject) => {
    subject.chapters.forEach((chapter) => {
      totalTasks++;
      if (chapter.completed) completedTasks++;

      // Count sub-items for chapters only
      if (chapter.type === "chapter") {
        totalTasks += chapter.subItems.length;
        completedTasks += chapter.subItems.filter(
          (item) => item.completed
        ).length;
      }
    });
  });

  return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
}

function scrollToGoal(goalId) {
  const goalElement = document.getElementById(`goal_${goalId}`);
  if (goalElement) {
    goalElement.scrollIntoView({ behavior: "smooth", block: "start" });
    goalElement.classList.add("ring-2");
    goalElement.style.setProperty("--tw-ring-color", "var(--accent-tertiary)");
    setTimeout(() => {
      goalElement.classList.remove("ring-2");
    }, 2000);
  }
}

function scrollToSubject(goalId, subjectId) {
  const subjectElement = document.getElementById(
    `subject_${goalId}_${subjectId}`
  );
  if (subjectElement) {
    subjectElement.scrollIntoView({ behavior: "smooth", block: "start" });
    subjectElement.classList.add("ring-2");
    subjectElement.style.setProperty(
      "--tw-ring-color",
      "var(--accent-secondary)"
    );
    setTimeout(() => {
      subjectElement.classList.remove("ring-2");
    }, 2000);
  }
}

function renderGoalShortcuts() {
  const shortcutsDiv = document.getElementById("goalShortcuts");
  shortcutsDiv.innerHTML = "";

  goals.forEach((goal) => {
    const shortcutBtn = document.createElement("button");
    shortcutBtn.className =
      "px-2 py-1 text-white text-xs rounded transition duration-200 hover:opacity-80";
    shortcutBtn.style.backgroundColor = "var(--accent-tertiary)";
    shortcutBtn.textContent =
      goal.name.length > 10 ? goal.name.substring(0, 10) + "..." : goal.name;
    shortcutBtn.onclick = () => scrollToGoal(goal.id);
    shortcutBtn.title = goal.name;
    shortcutsDiv.appendChild(shortcutBtn);
  });
}

function renderSubjectShortcuts(goal) {
  const shortcuts = goal.subjects
    .map((subject) => {
      return `<button onclick="scrollToSubject('${goal.id}', '${subject.id}')" 
                               class="px-1 py-1 bg-purple-200 text-purple-800 text-xs rounded transition duration-200 hover:bg-purple-300"
                               title="${subject.name}">
                    ${
                      subject.name.length > 8
                        ? subject.name.substring(0, 8) + "..."
                        : subject.name
                    }
                </button>`;
    })
    .join("");

  return shortcuts
    ? `<div class="flex flex-wrap gap-1 mb-2">${shortcuts}</div>`
    : "";
}

function sortChapters(chapters) {
  const pending = chapters.filter((chapter) => !chapter.completed);
  const completed = chapters.filter((chapter) => chapter.completed);
  return [...pending, ...completed];
}

function showChapterDropdown(event, goalId, subjectId, chapterId) {
  event.preventDefault();
  event.stopPropagation();

  const dropdown = document.getElementById("chapterDropdown");
  dropdown.classList.remove("hidden");
  dropdown.style.left = event.pageX + "px";
  dropdown.style.top = event.pageY + "px";

  currentDropdownChapter = { goalId, subjectId, chapterId };

  setTimeout(() => {
    document.addEventListener("click", hideChapterDropdown);
  }, 100);
}

function hideChapterDropdown() {
  document.getElementById("chapterDropdown").classList.add("hidden");
  document.removeEventListener("click", hideChapterDropdown);
}

function markChapterComplete() {
  if (!currentDropdownChapter) return;
  openPasswordModal(
    currentDropdownChapter.goalId,
    currentDropdownChapter.subjectId,
    currentDropdownChapter.chapterId
  );
  hideChapterDropdown();
}

function viewChapterDetails() {
  if (!currentDropdownChapter) return;

  const goal = goals.find((g) => g.id == currentDropdownChapter.goalId);
  const subject = goal.subjects.find(
    (s) => s.id == currentDropdownChapter.subjectId
  );
  const chapter = subject.chapters.find(
    (c) => c.id === currentDropdownChapter.chapterId
  );

  let details = `Chapter: ${chapter.name}\nType: ${chapter.type}\nStatus: ${
    chapter.completed ? "Completed" : "Pending"
  }`;
  if (chapter.subItems.length > 0) {
    details += `\n\nSub-items:\n${chapter.subItems
      .map((item) => `• ${item.name} ${item.completed ? "✓" : "○"}`)
      .join("\n")}`;
  }

  showAlert("Chapter Details", details, "info");
  hideChapterDropdown();
}

function renderActiveGoals() {
  const activeGoalsDiv = document.getElementById("activeGoals");
  activeGoalsDiv.innerHTML = "";

  goals.forEach((goal) => {
    goal.progress = calculateProgress(goal);

    if (goal.progress >= 100) {
      completedGoals.push({
        ...goal,
        completedDate: new Date().toISOString(),
      });
      goals = goals.filter((g) => g.id !== goal.id);
      saveToLocalStorage();
      renderCompletedGoals();
      return;
    }

    const goalDiv = document.createElement("div");
    goalDiv.id = `goal_${goal.id}`;
    goalDiv.className =
      "backdrop-filter bg-white bg-opacity-80 border border-gray-300 p-3 rounded-lg transition-all duration-300 shadow-sm";
    goalDiv.innerHTML = `
                    <div class="flex justify-between items-center mb-2">
                        <h3 class="text-lg font-bold" style="color: var(--text-primary)">${
                          goal.name
                        }</h3>
                        <span class="text-xl font-bold text-green-700">${
                          goal.progress
                        }%</span>
                    </div>
                    
                    <div class="w-full bg-gray-200 rounded-full h-2 mb-3">
                        <div class="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-300" style="width: ${
                          goal.progress
                        }%"></div>
                    </div>

                    ${renderSubjectShortcuts(goal)}

                    <div class="space-y-2">
                        ${goal.subjects
                          .map(
                            (subject) => `
                            <div id="subject_${goal.id}_${
                              subject.id
                            }" class="backdrop-filter bg-white bg-opacity-60 border border-gray-200 p-2 rounded transition-all duration-300">
                                <h4 class="font-semibold mb-2 text-sm" style="color: var(--text-secondary)">${
                                  subject.name
                                }</h4>
                                <div class="space-y-1">
                                    ${sortChapters(subject.chapters)
                                      .map(
                                        (chapter) => `
                                        <div class="backdrop-filter bg-white bg-opacity-70 border border-gray-200 p-2 rounded ${
                                          chapter.completed ? "opacity-60" : ""
                                        }">
                                            <div class="flex items-center justify-between">
                                                <span class="text-xs ${
                                                  chapter.completed
                                                    ? "line-through text-gray-500"
                                                    : ""
                                                }" style="color: ${
                                          chapter.completed
                                            ? "#6b7280"
                                            : "var(--text-primary)"
                                        }">${chapter.name}</span>
                                                <button onclick="showChapterDropdown(event, '${
                                                  goal.id
                                                }', '${subject.id}', '${
                                          chapter.id
                                        }')" 
                                                        class="px-2 py-1 rounded text-xs font-medium transition duration-200 text-white ${
                                                          chapter.completed
                                                            ? ""
                                                            : "hover:opacity-80"
                                                        }" 
                                                        style="background-color: ${
                                                          chapter.completed
                                                            ? "var(--accent-secondary)"
                                                            : "var(--accent-primary)"
                                                        }">
                                                    ${
                                                      chapter.completed
                                                        ? "✓"
                                                        : "⚡"
                                                    }
                                                </button>
                                            </div>
                                            ${
                                              chapter.type === "chapter" &&
                                              chapter.subItems.length > 0
                                                ? `
                                                <div class="mt-1 ml-2 space-y-1">
                                                    ${chapter.subItems
                                                      .map(
                                                        (subItem) => `
                                                        <div class="flex items-center justify-between text-xs">
                                                            <span class="${
                                                              subItem.completed
                                                                ? "line-through text-gray-500"
                                                                : "text-gray-700"
                                                            }">${
                                                          subItem.name
                                                        }</span>
                                                            <button onclick="toggleSubItem('${
                                                              goal.id
                                                            }', '${
                                                          subject.id
                                                        }', '${chapter.id}', '${
                                                          subItem.id
                                                        }')"
                                                                    class="px-1 py-1 rounded text-xs transition duration-200 text-white ${
                                                                      subItem.completed
                                                                        ? ""
                                                                        : "hover:opacity-80"
                                                                    }"
                                                                    style="background-color: ${
                                                                      subItem.completed
                                                                        ? "var(--accent-secondary)"
                                                                        : "#9ca3af"
                                                                    }">
                                                                ${
                                                                  subItem.completed
                                                                    ? "✓"
                                                                    : "○"
                                                                }
                                                            </button>
                                                        </div>
                                                    `
                                                      )
                                                      .join("")}
                                                </div>
                                            `
                                                : ""
                                            }
                                        </div>
                                    `
                                      )
                                      .join("")}
                                </div>
                            </div>
                        `
                          )
                          .join("")}
                    </div>
                `;
    activeGoalsDiv.appendChild(goalDiv);
  });

  renderGoalShortcuts();
  updateProgressTracker();
}

function renderCompletedGoals() {
  const completedGoalsDiv = document.getElementById("completedGoals");
  completedGoalsDiv.innerHTML = "";

  completedGoals.forEach((goal) => {
    const goalDiv = document.createElement("div");
    goalDiv.className =
      "backdrop-filter bg-green-50 bg-opacity-80 border border-green-300 p-2 rounded-lg border-l-4 border-l-green-600";
    goalDiv.innerHTML = `
                    <h4 class="font-semibold text-green-800 text-sm">${
                      goal.name
                    }</h4>
                    <p class="text-xs text-green-600 mt-1">Completed: ${new Date(
                      goal.completedDate
                    ).toLocaleDateString()}</p>
                    <div class="w-full bg-green-300 rounded-full h-1 mt-1">
                        <div class="bg-green-600 h-1 rounded-full" style="width: 100%"></div>
                    </div>
                `;
    completedGoalsDiv.appendChild(goalDiv);
  });
}

function updateProgressTracker() {
  const progressTrackerDiv = document.getElementById("progressTracker");

  if (goals.length > 0) {
    const currentGoal = goals[0];
    progressTrackerDiv.innerHTML = `
                    <div class="backdrop-filter bg-white bg-opacity-80 border p-3 rounded-lg" style="border-color: var(--border-color)">
                        <h3 class="text-md font-bold mb-2" style="color: var(--text-primary)">${currentGoal.name}</h3>
                        <div class="w-full bg-gray-200 rounded-full h-2 mb-2">
                            <div class="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-300" style="width: ${currentGoal.progress}%"></div>
                        </div>
                        <p class="text-lg font-bold text-center text-green-700">${currentGoal.progress}%</p>
                    </div>
                `;
  } else {
    progressTrackerDiv.innerHTML = `
                    <div class="backdrop-filter bg-white bg-opacity-80 border p-3 rounded-lg text-center" style="border-color: var(--border-color)">
                        <p style="color: var(--text-secondary)">No active goals</p>
                    </div>
                `;
  }
}

function openPasswordModal(goalId, subjectId, chapterId) {
  if (!masterPassword) {
    showAlert(
      "Password Required",
      "Please set a master password first",
      "warning"
    );
    showPasswordSetup();
    return;
  }

  currentTask = { goalId, subjectId, chapterId };
  document.getElementById("passwordModal").classList.remove("hidden");
  document.getElementById("taskPassword").focus();
}

function closePasswordModal() {
  document.getElementById("passwordModal").classList.add("hidden");
  document.getElementById("taskPassword").value = "";
  document.getElementById("confirmCompletion").checked = false;
  currentTask = null;
}

function confirmTaskCompletion() {
  const password = document.getElementById("taskPassword").value;
  const confirmCompletion =
    document.getElementById("confirmCompletion").checked;

  if (password !== masterPassword) {
    showAlert("Authentication Failed", "Incorrect password", "error");
    return;
  }

  if (!confirmCompletion) {
    showAlert(
      "Confirmation Required",
      "Please confirm that you have completed the task",
      "warning"
    );
    return;
  }

  const goal = goals.find((g) => g.id == currentTask.goalId);
  const subject = goal.subjects.find((s) => s.id == currentTask.subjectId);
  const chapter = subject.chapters.find((c) => c.id === currentTask.chapterId);

  chapter.completed = true;

  saveToLocalStorage();
  renderActiveGoals();
  closePasswordModal();
  showAlert(
    "Task Completed",
    "Great job! Your task has been marked as complete.",
    "success"
  );
}

function toggleSubItem(goalId, subjectId, chapterId, subItemId) {
  const goal = goals.find((g) => g.id == goalId);
  const subject = goal.subjects.find((s) => s.id == subjectId);
  const chapter = subject.chapters.find((c) => c.id === chapterId);
  const subItem = chapter.subItems.find((s) => s.id === subItemId);

  subItem.completed = !subItem.completed;

  saveToLocalStorage();
  renderActiveGoals();
}

// Initialize the app
initializeTheme();
renderActiveGoals();
renderCompletedGoals();

// Update password button text based on whether password exists
if (masterPassword) {
  document.getElementById("setPasswordBtn").className = "hidden";
}
