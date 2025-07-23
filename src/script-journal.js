document.addEventListener("DOMContentLoaded", function () {
  // DOM Elements
  const editor = document.getElementById("editor");
  const entryTitle = document.getElementById("entryTitle");
  const previousEntries = document.getElementById("previousEntries");
  const saveEntryBtn = document.getElementById("saveEntryBtn");
  const newEntryBtn = document.getElementById("newEntryBtn");
  const fontSelect = document.getElementById("fontSelect");
  const sizeSelect = document.getElementById("sizeSelect");
  const colorPicker = document.getElementById("colorPicker");
  const addPictureBtn = document.getElementById("addPictureBtn");
  const addAudioBtn = document.getElementById("addAudioBtn");
  const addVideoBtn = document.getElementById("addVideoBtn");
  const lockBtn = document.getElementById("lockBtn");
  const widget = document.getElementById("widget");
  const lockScreen = document.getElementById("lockScreen");
  const passwordInput = document.getElementById("passwordInput");
  const unlockBtn = document.getElementById("unlockBtn");
  const mediaContainer = document.getElementById("mediaContainer");

  // State
  let currentEntryId = null;
  let isLocked = localStorage.getItem("diaryLocked") === "true";
  const savedPassword = localStorage.getItem("diaryPassword");

  // Initialize
  const urlParams = new URLSearchParams(window.location.search);
  const fromWidget = urlParams.get("fromWidget");

  if (fromWidget) {
    createNewEntry();
    editor.focus();
  }

  if (window.location.pathname.includes("widget.html")) {
    document.getElementById("mainApp").classList.add("hidden");
    widget.classList.remove("hidden");
  } else {
    loadEntries();
    checkLockStatus();
  }

  // Placeholder handling for contenteditable
  function handlePlaceholder() {
    if (editor.textContent.trim() === "") {
      editor.innerHTML = "";
      editor.setAttribute("data-empty", "true");
    } else {
      editor.removeAttribute("data-empty");
    }
  }

  editor.addEventListener("input", handlePlaceholder);
  editor.addEventListener("focus", function () {
    if (this.getAttribute("data-empty") === "true") {
      this.innerHTML = "";
      this.removeAttribute("data-empty");
    }
  });
  editor.addEventListener("blur", handlePlaceholder);
  handlePlaceholder();

  // CSS for placeholder
  const style = document.createElement("style");
  style.textContent = `
          .editor[data-empty="true"]::before {
            content: attr(data-placeholder);
            color: #9ca3af;
            pointer-events: none;
            position: absolute;
          }
        `;
  document.head.appendChild(style);

  // Event Listeners
  saveEntryBtn.addEventListener("click", saveEntry);
  newEntryBtn.addEventListener("click", createNewEntry);
  fontSelect.addEventListener("change", updateFont);
  sizeSelect.addEventListener("change", updateSize);
  colorPicker.addEventListener("input", updateColor);
  addPictureBtn.addEventListener("click", addPicture);
  addAudioBtn.addEventListener("click", addAudio);
  addVideoBtn.addEventListener("click", addVideo);
  lockBtn.addEventListener("click", toggleLock);
  widget.addEventListener("click", openMainApp);
  unlockBtn.addEventListener("click", unlockDiary);

  // Functions
  function loadEntries() {
    previousEntries.innerHTML = "";
    const entries = JSON.parse(localStorage.getItem("journalEntries") || "[]");

    entries
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .forEach((entry) => {
        const entryElement = document.createElement("div");
        entryElement.className =
          "entry-card p-3 rounded-lg cursor-pointer text-sm transition-all duration-300";
        entryElement.innerHTML = `
                <div class="font-medium text-amber-900">${
                  entry.title || "Untitled Entry"
                }</div>
                <div class="text-xs text-amber-700 mt-1">${formatDate(
                  entry.date
                )}</div>
                <div class="text-xs text-gray-600 mt-1">${entry.content
                  .replace(/<[^>]*>/g, "")
                  .substring(0, 50)}${
          entry.content.length > 50 ? "..." : ""
        }</div>
              `;
        entryElement.addEventListener("click", () => loadEntry(entry.id));
        previousEntries.appendChild(entryElement);
      });
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function loadEntry(id) {
    const entries = JSON.parse(localStorage.getItem("journalEntries") || "[]");
    const entry = entries.find((e) => e.id === id);

    if (entry) {
      currentEntryId = id;
      entryTitle.value = entry.title || "";
      editor.innerHTML = entry.content;

      // Load media content
      if (entry.media) {
        mediaContainer.innerHTML = entry.media;
        // Reattach event listeners to remove buttons
        attachRemoveListeners();
      } else {
        mediaContainer.innerHTML = "";
      }

      handlePlaceholder();
    }
  }

  function attachRemoveListeners() {
    document.querySelectorAll(".remove-media").forEach((btn) => {
      btn.addEventListener("click", function () {
        this.parentElement.remove();
      });
    });
  }

  function saveEntry() {
    const entries = JSON.parse(localStorage.getItem("journalEntries") || "[]");
    const now = new Date().toISOString();

    // Create a copy of mediaContainer for saving (without remove buttons visible in stored data)
    const mediaContainerCopy = mediaContainer.cloneNode(true);
    mediaContainerCopy
      .querySelectorAll(".remove-media")
      .forEach((btn) => (btn.style.display = "none"));

    const entryData = {
      id: currentEntryId || Date.now().toString(),
      title: entryTitle.value || "Untitled Entry",
      content: editor.innerHTML,
      date: now,
      media: mediaContainerCopy.innerHTML,
    };

    if (currentEntryId) {
      const index = entries.findIndex((e) => e.id === currentEntryId);
      if (index !== -1) {
        entries[index] = entryData;
      }
    } else {
      entries.push(entryData);
      currentEntryId = entryData.id;
    }

    localStorage.setItem("journalEntries", JSON.stringify(entries));
    loadEntries();
    playSuccessSound();
    showNotification("✅ Entry saved successfully!", "success");
  }

  function playSuccessSound() {
    // Create a simple success sound using Web Audio API
    try {
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(
        1000,
        audioContext.currentTime + 0.1
      );

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.2
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (e) {
      console.log("Audio not supported");
    }
  }

  function createNewEntry() {
    currentEntryId = null;
    entryTitle.value = "";
    editor.innerHTML = "";
    mediaContainer.innerHTML = "";
    handlePlaceholder();
    editor.focus();
  }

  function updateFont() {
    const font = fontSelect.value;
    let fontFamily;

    switch (font) {
      case "serif":
        fontFamily = "'Noto Serif JP', serif";
        break;
      case "sans":
        fontFamily = "'Noto Sans JP', sans-serif";
        break;
      case "calligraphy":
        fontFamily = "'Ma Shan Zheng', cursive";
        break;
      case "chinese":
        fontFamily = "'Zcool XiaoWei', sans-serif";
        break;
      default:
        fontFamily = "'Noto Serif JP', serif";
    }

    // Apply font to selected text or entire editor if no selection
    const selection = window.getSelection();
    if (selection.rangeCount > 0 && !selection.isCollapsed) {
      document.execCommand("fontName", false, fontFamily);
    } else {
      editor.style.fontFamily = fontFamily;
    }
  }

  function updateSize() {
    const size = sizeSelect.value;
    document.execCommand("fontSize", false, size);
  }

  function updateColor() {
    const color = colorPicker.value;
    document.execCommand("foreColor", false, color);
  }

  function addMedia(type) {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = `${type}/*`;

    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const mediaDiv = document.createElement("div");
          mediaDiv.className = "media-item";

          let mediaElement;
          if (type === "image") {
            mediaElement = document.createElement("img");
            mediaElement.src = event.target.result;
            mediaElement.className = "max-w-full h-auto rounded-lg shadow-lg";
            mediaElement.alt = "Journal image";
          } else if (type === "audio") {
            mediaElement = document.createElement("audio");
            mediaElement.src = event.target.result;
            mediaElement.controls = true;
            mediaElement.className = "w-full";
            mediaElement.preload = "metadata";
          } else if (type === "video") {
            mediaElement = document.createElement("video");
            mediaElement.src = event.target.result;
            mediaElement.controls = true;
            mediaElement.className = "w-full max-h-96";
            mediaElement.preload = "metadata";
          }

          const removeBtn = document.createElement("div");
          removeBtn.className = "remove-media";
          removeBtn.innerHTML = "×";
          removeBtn.title = "Remove media";
          removeBtn.addEventListener("click", function () {
            mediaDiv.remove();
          });

          mediaDiv.appendChild(mediaElement);
          mediaDiv.appendChild(removeBtn);
          mediaContainer.appendChild(mediaDiv);

          showNotification(
            `📎 ${
              type.charAt(0).toUpperCase() + type.slice(1)
            } added successfully!`,
            "success"
          );
        };
        reader.readAsDataURL(file);
      }
    };

    input.click();
  }

  function addPicture() {
    addMedia("image");
  }

  function addAudio() {
    addMedia("audio");
  }

  function addVideo() {
    addMedia("video");
  }

  function toggleLock() {
    if (!savedPassword) {
      // First time setting password
      const password = prompt("Set a password for your journal:");
      if (password && password.trim()) {
        localStorage.setItem("diaryPassword", password.trim());
        localStorage.setItem("diaryLocked", "true");
        isLocked = true;
        lockScreen.classList.remove("hidden");
        document.getElementById("mainApp").classList.add("hidden");
        showNotification("🔒 Journal locked with new password!", "success");
      }
    } else {
      // Toggle lock with existing password
      if (isLocked) {
        // Currently locked, show unlock screen
        lockScreen.classList.remove("hidden");
        document.getElementById("mainApp").classList.add("hidden");
      } else {
        // Currently unlocked, lock it
        localStorage.setItem("diaryLocked", "true");
        isLocked = true;
        lockScreen.classList.remove("hidden");
        document.getElementById("mainApp").classList.add("hidden");
        showNotification("🔒 Journal locked!", "success");
      }
    }
  }

  function checkLockStatus() {
    if (isLocked && savedPassword) {
      lockScreen.classList.remove("hidden");
      document.getElementById("mainApp").classList.add("hidden");
    }
  }

  function unlockDiary() {
    const enteredPassword = passwordInput.value.trim();
    if (enteredPassword === savedPassword) {
      isLocked = false;
      localStorage.setItem("diaryLocked", "false");
      lockScreen.classList.add("hidden");
      document.getElementById("mainApp").classList.remove("hidden");
      passwordInput.value = "";
      showNotification("🔓 Journal unlocked!", "success");
    } else {
      showNotification("❌ Incorrect password!", "error");
      passwordInput.value = "";
      passwordInput.focus();
    }
  }

  // Allow Enter key to unlock
  passwordInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      unlockDiary();
    }
  });

  function openMainApp() {
    window.location.href = "index.html?fromWidget=true";
  }

  function showNotification(message, type) {
    const notification = document.createElement("div");
    const bgColor = type === "success" ? "bg-green-600" : "bg-red-600";
    notification.className = `notification fixed top-4 right-4 ${bgColor} text-white px-4 py-3 rounded-lg text-sm font-medium z-50 shadow-xl`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.opacity = "0";
      notification.style.transform = "translateX(100%)";
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
});
