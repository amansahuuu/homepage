document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("achievement-widget");
  const achievements = JSON.parse(
    localStorage.getItem("achievement_log") || "[]"
  );

  if (!container) return;

  if (achievements.length === 0) {
    container.innerHTML = `<p class="text-white/70">No achievements yet.</p>`;
    return;
  }

  const list = document.createElement("ul");
  list.className = "space-y-2";

  achievements.forEach((entry) => {
    const item = document.createElement("li");
    item.className = " p-2 rounded-lg";
    item.innerHTML = `<div class="p-4 bg-white/40 backdrop-blur-sm rounded-lg shadow-sm space-y-2 hover:bg-white/60 transition-all">
  <div class="text-gray-800 opacity-90 text-base leading-relaxed">
    ${entry.text}
  </div>
  
  <div class="text-sm text-gray-600 font-semibold">
    • ${entry.time}
  </div>

  
</div>

    `;
    list.appendChild(item);
  });

  const openMainBtn = document.createElement("button");
  openMainBtn.innerText = "Open Main App";
  openMainBtn.className =
    "block mt-4 bg-pink-500/40 hover:bg-pink-500/60 transition text-white px-3 py-1 rounded-md";
  openMainBtn.onclick = () => {
    window.open("acheivement-logger.html", "_blank");
  };

  container.appendChild(list);
  //container.appendChild(openMainBtn);
});
