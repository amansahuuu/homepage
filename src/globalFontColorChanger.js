// Load settings from localStorage on page load
function loadSettings() {
  const savedFont = localStorage.getItem("userFontFamily");
  const savedColor = localStorage.getItem("userFontColor");

  if (savedFont) {
    currentSettings.fontFamily = savedFont;
  }
  if (savedColor) {
    currentSettings.fontColor = savedColor;
  }

  // Apply saved settings immediately
  if (savedFont || savedColor) {
    applySettingsOnLoad();
  }
}

// Apply settings without opening popup (for page load)
function applySettingsOnLoad() {
  // Apply font family to body
  if (currentSettings.fontFamily) {
    document.body.style.fontFamily = currentSettings.fontFamily;
  }

  // Create or update style tag for text color
  if (currentSettings.fontColor) {
    let styleTag = document.getElementById("user-font-style");
    if (!styleTag) {
      styleTag = document.createElement("style");
      styleTag.id = "user-font-style";
      document.head.appendChild(styleTag);
    }

    styleTag.textContent = `
      body, body * {
        color: ${currentSettings.fontColor} !important;
      }
      input, textarea, select {
        color: #374151 !important;
      }
    `;
  }
}

// Store settings in memory and localStorage
let currentSettings = {
  fontFamily:
    "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  fontColor: "#000000",
};

function openFontSettings() {
  if (document.getElementById("fontPopup")) return;

  const popup = document.createElement("div");
  popup.id = "fontPopup";
  popup.className =
    "fixed inset-0 bg-black/70 flex items-center justify-center z-50";

  popup.innerHTML = `
    <div class="bg-white p-6 rounded-lg shadow-xl" style="width: 400px; height: 450px; min-width: 400px; max-width: 400px;">
      <h2 class="text-lg font-medium text-gray-900 mb-6">Font Settings</h2>
      
      <div class="space-y-5">
        <div>
          <label class="block text-sm text-gray-700 mb-2">Font Style</label>
          <select id="fontSelect" class="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-400">
            <option value="'Inter', sans-serif">Inter</option>
            <option value="'Roboto', sans-serif">Roboto</option>
            <option value="'Open Sans', sans-serif">Open Sans</option>
            <option value="'Lato', sans-serif">Lato</option>
            <option value="'Montserrat', sans-serif">Montserrat</option>
            <option value="'Poppins', sans-serif">Poppins</option>
            <option value="'Playfair Display', serif">Playfair Display</option>
            <option value="'Source Code Pro', monospace">Source Code Pro</option>
            <option value="Georgia, serif">Georgia</option>
            <option value="'Courier New', monospace">Courier New</option>
            <option value="Arial, sans-serif">Arial</option>
            <option value="Helvetica, sans-serif">Helvetica</option>
            <option value="Verdana, sans-serif">Verdana</option>
            <option value="Times New Roman, serif">Times New Roman</option>
            <option value="Lucida Console, monospace">Lucida Console</option>
            <option value="Brush Script MT, cursive">Brush Script MT</option>
            <option value="Comic Sans MS, cursive">Comic Sans MS</option>
            <option value="Impact, fantasy">Impact</option>
            <option value="Palatino, serif">Palatino</option>
            <option value="Garamond, serif">Garamond</option>
          </select>
        </div>
        
        <div>
          <label class="block text-sm font-medium mb-2 text-gray-700">Font Color:</label>
          <div class="space-y-3">
            <div class="flex flex-wrap gap-2">
              <button onclick="selectColor('#000000')" class="color-preset w-8 h-8 bg-black rounded-sm border-2 border-gray-300 hover:border-blue-500 transition-colors" title="Black"></button>
              <button onclick="selectColor('#dc2626')" class="color-preset w-8 h-8 bg-red-600 rounded-sm border-2 border-gray-300 hover:border-blue-500 transition-colors" title="Red"></button>
              <button onclick="selectColor('#16a34a')" class="color-preset w-8 h-8 bg-green-600 rounded-sm border-2 border-gray-300 hover:border-blue-500 transition-colors" title="Green"></button>
              <button onclick="selectColor('#2563eb')" class="color-preset w-8 h-8 bg-blue-600 rounded-sm border-2 border-gray-300 hover:border-blue-500 transition-colors" title="Blue"></button>
              <button onclick="selectColor('#EEE1C6')" class="color-preset w-8 h-8 bg-white rounded-sm border-2 border-gray-300 hover:border-blue-500 transition-colors" title="Cream"></button>
            </div>
            <div class="flex items-center gap-2">
              <label for="customColorPicker" class="text-sm text-gray-600">Custom:</label>
              <input type="color" id="customColorPicker" value="${currentSettings.fontColor}" onchange="selectColor(this.value)" class="w-12 h-8 rounded border border-gray-300 cursor-pointer">
              <span id="colorDisplay" class="text-sm text-gray-500 font-mono">${currentSettings.fontColor}</span>
            </div>
          </div>
        </div>
        
        <div>
          <label class="block text-sm text-gray-700 mb-2">Preview</label>
          <div id="previewText" class="p-3 border border-gray-200 rounded bg-gray-50 text-sm" style="font-family: ${currentSettings.fontFamily}; color: ${currentSettings.fontColor};">
            Sample text with your settings
          </div>
        </div>
      </div>
      
      <div class="flex justify-end gap-2 mt-8">
        <button onclick="closePopup()" class="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">
          Cancel
        </button>
        <button style="color:white;" onclick="applySettings()" class="px-4 py-2 bg-black text-white text-sm rounded hover:bg-gray-800">
          Apply
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(popup);

  // Set current values
  document.getElementById("fontSelect").value = currentSettings.fontFamily;
  document.getElementById("customColorPicker").value =
    currentSettings.fontColor;
  updateColorDisplay(currentSettings.fontColor);
  updatePreview();

  // Add event listener for font changes
  document
    .getElementById("fontSelect")
    .addEventListener("change", updatePreview);
}

function selectColor(color) {
  currentSettings.fontColor = color;
  document.getElementById("customColorPicker").value = color;
  updateColorDisplay(color);
  updatePreview();

  // Update active state for preset buttons
  document.querySelectorAll(".color-preset").forEach((btn) => {
    btn.classList.remove("ring-2", "ring-blue-500");
  });
}

function updateColorDisplay(color) {
  const display = document.getElementById("colorDisplay");
  if (display) {
    display.textContent = color.toUpperCase();
  }
}

function updatePreview() {
  const preview = document.getElementById("previewText");
  const fontSelect = document.getElementById("fontSelect");

  if (preview && fontSelect) {
    const selectedFont = fontSelect.value;
    preview.style.fontFamily = selectedFont;
    preview.style.color = currentSettings.fontColor;
    currentSettings.fontFamily = selectedFont;
  }
}

function applySettings() {
  // Save to localStorage
  localStorage.setItem("userFontFamily", currentSettings.fontFamily);
  localStorage.setItem("userFontColor", currentSettings.fontColor);

  // Apply font family to body
  document.body.style.fontFamily = currentSettings.fontFamily;

  // Apply color using CSS custom property for better control
  document.documentElement.style.setProperty(
    "--user-text-color",
    currentSettings.fontColor
  );

  // Create or update style tag for text color
  let styleTag = document.getElementById("user-font-style");
  if (!styleTag) {
    styleTag = document.createElement("style");
    styleTag.id = "user-font-style";
    document.head.appendChild(styleTag);
  }

  styleTag.textContent = `
    body, body * {
      color: ${currentSettings.fontColor} !important;
    }
    input, textarea, select {
      color: #374151 !important;
    }
  `;

  closePopup();
}

function closePopup() {
  const popup = document.getElementById("fontPopup");
  if (popup) {
    popup.remove();
  }
}

// Close popup when clicking outside
document.addEventListener("click", function (event) {
  const popup = document.getElementById("fontPopup");
  if (popup && event.target === popup) {
    closePopup();
  }
});

// Close popup on Escape key
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    closePopup();
  }
});

// Load settings when page loads
window.addEventListener("load", loadSettings);

// Also load settings when DOM is ready (backup)
document.addEventListener("DOMContentLoaded", loadSettings);
