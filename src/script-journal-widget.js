document.addEventListener("DOMContentLoaded", function () {
  loadRecentEntries();

  // Refresh entries every 30 seconds in case they're updated in the main app
  setInterval(loadRecentEntries, 30000);
});

function loadRecentEntries() {
  const entriesContainer = document.getElementById("entriesContainer");
  const entries = JSON.parse(localStorage.getItem("journalEntries") || "[]");

  if (entries.length === 0) {
    entriesContainer.innerHTML = `
            <div class="no-entries">
              <div>📖</div>
              <div>No entries yet</div>
              <div>Start writing your first entry!</div>
            </div>
          `;
    return;
  }

  // Get the 3 most recent entries
  const recentEntries = entries
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 3);

  entriesContainer.innerHTML = "";

  recentEntries.forEach((entry, index) => {
    const entryElement = document.createElement("a");
    entryElement.href = `dailyjournal.html?entry=${entry.id}`;
    entryElement.className = "entry-item";
    entryElement.style.animationDelay = `${index * 0.1}s`;

    // Clean content for preview
    const cleanContent = entry.content.replace(/<[^>]*>/g, "").trim();
    const preview =
      cleanContent.length > 80
        ? cleanContent.substring(0, 80) + "..."
        : cleanContent;

    entryElement.innerHTML = `
            <div class="entry-title">${entry.title || "Untitled Entry"}</div>
            <div class="entry-date">${formatDate(entry.date)}</div>
            <div class="entry-preview">${
              preview || "No content preview available"
            }</div>
          `;

    entriesContainer.appendChild(entryElement);
  });
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return (
      "Today " +
      date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  } else if (diffDays === 1) {
    return "Yesterday";
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  }
}
