// Color extraction functions
function getImageData(img) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  // Resize for performance
  const maxSize = 200;
  let { width, height } = img;

  if (width > height) {
    if (width > maxSize) {
      height = (height * maxSize) / width;
      width = maxSize;
    }
  } else {
    if (height > maxSize) {
      width = (width * maxSize) / height;
      height = maxSize;
    }
  }

  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(img, 0, 0, width, height);

  return ctx.getImageData(0, 0, width, height);
}

function getKMeansColors(imageData, k = 5) {
  const data = imageData.data;
  const pixels = [];

  // Sample pixels for performance
  for (let i = 0; i < data.length; i += 16) {
    if (data[i + 3] > 128) {
      // Skip transparent
      pixels.push([data[i], data[i + 1], data[i + 2]]);
    }
  }

  if (pixels.length === 0) return [{ r: 100, g: 100, b: 100 }];

  // Initialize centroids
  const centroids = [];
  for (let i = 0; i < k; i++) {
    const randomPixel = pixels[Math.floor(Math.random() * pixels.length)];
    centroids.push([...randomPixel]);
  }

  // K-means iterations
  for (let iter = 0; iter < 10; iter++) {
    const clusters = Array(k)
      .fill()
      .map(() => []);

    // Assign pixels to nearest centroid
    pixels.forEach((pixel) => {
      let minDistance = Infinity;
      let clusterIndex = 0;

      centroids.forEach((centroid, i) => {
        const distance = Math.sqrt(
          Math.pow(pixel[0] - centroid[0], 2) +
            Math.pow(pixel[1] - centroid[1], 2) +
            Math.pow(pixel[2] - centroid[2], 2)
        );

        if (distance < minDistance) {
          minDistance = distance;
          clusterIndex = i;
        }
      });

      clusters[clusterIndex].push(pixel);
    });

    // Update centroids
    centroids.forEach((centroid, i) => {
      if (clusters[i].length > 0) {
        centroid[0] =
          clusters[i].reduce((sum, p) => sum + p[0], 0) / clusters[i].length;
        centroid[1] =
          clusters[i].reduce((sum, p) => sum + p[1], 0) / clusters[i].length;
        centroid[2] =
          clusters[i].reduce((sum, p) => sum + p[2], 0) / clusters[i].length;
      }
    });
  }

  // Sort by cluster size and return colors
  const colorClusters = centroids.map((centroid, i) => {
    const clusterSize = pixels.filter((pixel) => {
      const distances = centroids.map((c) =>
        Math.sqrt(
          Math.pow(pixel[0] - c[0], 2) +
            Math.pow(pixel[1] - c[1], 2) +
            Math.pow(pixel[2] - c[2], 2)
        )
      );
      return distances.indexOf(Math.min(...distances)) === i;
    }).length;

    return {
      r: Math.round(centroid[0]),
      g: Math.round(centroid[1]),
      b: Math.round(centroid[2]),
      size: clusterSize,
    };
  });

  return colorClusters.sort((a, b) => b.size - a.size);
}

function rgbToHex(r, g, b) {
  return (
    "#" +
    [r, g, b]
      .map((x) => {
        const hex = x.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")
  );
}

function adjustBrightness(color, factor) {
  return {
    r: Math.min(255, Math.max(0, Math.round(color.r * factor))),
    g: Math.min(255, Math.max(0, Math.round(color.g * factor))),
    b: Math.min(255, Math.max(0, Math.round(color.b * factor))),
  };
}

function updateElementClass(elementId, newBgClass, hoverClass = "") {
  const element = document.getElementById(elementId);
  if (!element) return;

  // Remove existing bg- classes
  const classes = element.className.split(" ");
  const filteredClasses = classes.filter(
    (cls) =>
      !cls.startsWith("bg-[") &&
      !cls.startsWith("hover:bg-[") &&
      !cls.startsWith("bg-blue") &&
      !cls.startsWith("bg-green") &&
      !cls.startsWith("bg-purple") &&
      !cls.startsWith("bg-gray") &&
      !cls.startsWith("bg-white") &&
      !cls.startsWith("bg-red")
  );

  // Add new classes
  filteredClasses.push(newBgClass);
  if (hoverClass) filteredClasses.push(hoverClass);

  element.className = filteredClasses.join(" ");
}

// Main function to apply theme
function applyTheme(imageUrl) {
  const img = new Image();
  img.crossOrigin = "anonymous";

  img.onload = function () {
    // Update background
    const bodyElement = document.getElementById("bodyElement");
    bodyElement.style.backgroundImage = `url(${imageUrl})`;

    // Extract colors
    const imageData = getImageData(img);
    const colors = getKMeansColors(imageData, 5);

    // Apply colors to elements
    applyColorsToElements(colors);

    // Update theme indicator
    const themeIndicator = document.getElementById("themeIndicator");
    const dominantHex = rgbToHex(colors[0].r, colors[0].g, colors[0].b);
    themeIndicator.style.backgroundColor = dominantHex + "40"; // 25% opacity
    themeIndicator.title = `Current theme: ${dominantHex}`;
  };

  img.src = imageUrl;
}

function applyColorsToElements(colors) {
  // Get base colors with variations
  const primary = colors[0];
  const secondary = colors[1] || primary;
  const tertiary = colors[2] || secondary;
  const quaternary = colors[3] || tertiary;

  // Create variations
  const primaryHex = rgbToHex(primary.r, primary.g, primary.b);
  const primaryLight = adjustBrightness(primary, 1.4);
  const primaryLightHex = rgbToHex(
    primaryLight.r,
    primaryLight.g,
    primaryLight.b
  );
  const primaryDark = adjustBrightness(primary, 0.6);
  const primaryDarkHex = rgbToHex(primaryDark.r, primaryDark.g, primaryDark.b);

  const secondaryHex = rgbToHex(secondary.r, secondary.g, secondary.b);
  const tertiaryHex = rgbToHex(tertiary.r, tertiary.g, tertiary.b);
  const quaternaryHex = rgbToHex(quaternary.r, quaternary.g, quaternary.b);

  // Apply to main buttons (desktop)
  updateElementClass(
    "changeBgBtn",
    `bg-[${primaryHex}]`,
    `hover:bg-[${primaryDarkHex}]`
  );
  updateElementClass("aakashBtn", `bg-[${secondaryHex}]`);
  updateElementClass("teamsBtn", `bg-[${tertiaryHex}]`);
  updateElementClass("youtubeBtn", `bg-[${quaternaryHex}]`);
  updateElementClass("accessibilityBtn", `bg-[${primaryLightHex}]`);

  // Apply to widget containers
  updateElementClass("countdownWidget", `bg-[${primaryLightHex}]/40`);
  updateElementClass("weatherWidget", `bg-[${secondaryHex}]/30`);
  updateElementClass("todoWidget", `bg-[${tertiaryHex}]/35`);
  updateElementClass("achievementWidget", `bg-[${quaternaryHex}]/30`);
  updateElementClass("mobileActionsWidget", `bg-[${primaryHex}]/25`);

  // Apply to widget buttons
  updateElementClass("countdownOpenBtn", `bg-[${primaryHex}]`);
  updateElementClass("todoOpenBtn", `bg-[${secondaryHex}]`);
  updateElementClass("streakOpenBtn", `bg-[${tertiaryHex}]`);
  updateElementClass("streakAddBtn", `bg-[${primaryDarkHex}]`);
  updateElementClass("achievementOpenBtn", `bg-[${quaternaryHex}]`);

  // Apply to mobile buttons
  updateElementClass("bgUploadMobileBtn", `bg-[${primaryHex}]`);
  updateElementClass("aakashMobileBtn", `bg-[${secondaryHex}]`);
  updateElementClass("teamsMobileBtn", `bg-[${tertiaryHex}]`);
  updateElementClass("youtubeMobileBtn", `bg-[${quaternaryHex}]`);
  updateElementClass("accessibilityMobileBtn", `bg-[${primaryLightHex}]`);
  updateElementClass("countdownMobileBtn", `bg-[${primaryHex}]`);
  updateElementClass("todoMobileBtn", `bg-[${secondaryHex}]`);
  updateElementClass("achievementMobileBtn", `bg-[${tertiaryHex}]`);
  updateElementClass("journalMobileBtn", `bg-[${quaternaryHex}]`);

  // Apply to footer elements
  updateElementClass("footerElement", `bg-[${primaryHex}]/20`);
  updateElementClass(
    "footerBtn1",
    `bg-[${primaryHex}]`,
    `hover:bg-[${primaryDarkHex}]`
  );
  updateElementClass("footerBtn2", `bg-[${secondaryHex}]`);
  updateElementClass("footerBtn3", `bg-[${tertiaryHex}]`);

  // Update streak widget style
  const streakWidget = document.getElementById("streakWidget");
  if (streakWidget) {
    streakWidget.style.backgroundColor = `${primaryLightHex}40`; // 25% opacity
  }
}

// Handle file uploads
function handleImageUpload(fileInput) {
  const file = fileInput.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      applyTheme(e.target.result);
    };
    reader.readAsDataURL(file);
  }
}

// Update date and time
function updateDateTime() {
  const now = new Date();
  const options = {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  document.getElementById("currentDateTime").textContent =
    now.toLocaleDateString("en-US", options);
}

// Event listeners
document.getElementById("bgUpload").addEventListener("change", function (e) {
  handleImageUpload(e.target);
});

document
  .getElementById("bgUploadMobile")
  .addEventListener("change", function (e) {
    handleImageUpload(e.target);
  });

// Initialize
window.addEventListener("load", () => {
  // Apply default theme
  applyTheme(
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200"
  );

  // Start date/time updates
  updateDateTime();
  setInterval(updateDateTime, 60000); // Update every minute
});
