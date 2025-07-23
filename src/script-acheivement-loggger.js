const STORAGE_KEY = "achievement_log";

function getData() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  renderList();
}

function addAchievement() {
  const input = document.getElementById("achievement");
  const text = input.value.trim();
  if (!text) return;

  const newEntry = {
    text,
    time: new Date().toLocaleString(),
  };

  const data = getData();
  data.push(newEntry);
  saveData(data);
  input.value = "";
}

function renderList() {
  const list = document.getElementById("logList");
  const data = getData().reverse();
  list.innerHTML = data
    .map((entry) => `<li><strong>${entry.time}:</strong> ${entry.text}</li>`)
    .join("");
}

function exportData() {
  const data = JSON.stringify(getData(), null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "achievements.json";
  link.click();
}

function importData(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const imported = JSON.parse(e.target.result);
      if (Array.isArray(imported)) {
        saveData(imported);
      } else {
        alert("Invalid file format.");
      }
    } catch {
      alert("Failed to import file.");
    }
  };
  reader.readAsText(file);
}

window.onload = renderList;
