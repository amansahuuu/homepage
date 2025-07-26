// async function displayWeather() {
//   try {
//     // Get city from IP (approximate)
//     const ipResponse = await fetch("https://ipapi.co/json/");
//     const ipData = await ipResponse.json();
//     const city = ipData.city || "New York"; // Fallback city

//     // Fetch weather from wttr.in (text-only)
//     const response = await fetch(`https://wttr.in/${city}?format=%C+%t`);
//     const weatherText = await response.text();

//     // Display (no icon)
//     document.getElementById("weather").textContent = `${weatherText} • ${city}`;
//   } catch (error) {
//     console.error("Error:", error);
//     document.getElementById("weather").textContent = "Weather unavailable";
//   }
// }

// window.addEventListener("load", displayWeather);

// async function loadWeather() {
//   const weatherDiv = document.getElementById("weather");
//   weatherDiv.textContent = "Loading weather...";

//   try {
//     // Get city from IP (free, no API key)
//     const ipInfoRes = await fetch("https://ipapi.co/json/");
//     const ipInfo = await ipInfoRes.json();
//     const city = ipInfo.city;

//     // Get weather using wttr.in (no API key)
//     const wttrRes = await fetch(`https://wttr.in/${city}?format=%c+%t+%l`);
//     const weatherText = await wttrRes.text();

//     weatherDiv.textContent = weatherText;
//   } catch (err) {
//     console.error("Weather load error:", err);
//     weatherDiv.textContent = "⚠️ Weather unavailable";
//   }
// }

// window.addEventListener("DOMContentLoaded", loadWeather);

async function loadWeather() {
  const weatherDiv = document.getElementById("weather");
  weatherDiv.textContent = "Loading weather...";

  try {
    // Get user's city using IP
    const ipInfoRes = await fetch("https://ipapi.co/json/");
    const ipInfo = await ipInfoRes.json();
    const city = ipInfo.city;

    // Fetch weather from wttr.in
    const wttrRes = await fetch(`https://wttr.in/${city}?format=%c+%t+%l`);
    const weatherText = await wttrRes.text(); // Example: 🌤 +31°C New Delhi
    const [icon, temp, ...cityParts] = weatherText.trim().split(" ");
    const cityName = cityParts.join(" ");

    // Inject formatted HTML
    weatherDiv.innerHTML = `
        <div class="flex items-center space-x-2">
          <span style="font-family: 'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji','EmojiOne Color','Twemoji Mozilla',sans-serif; line-height: 1;">
            ${icon}
          </span>
          <div class="text-sm font-medium text-gray-800">
            <div>${temp}</div>
            <div class="text-xs text-gray-500">${cityName}</div>
          </div>
        </div>
      `;
  } catch (err) {
    console.error("Weather load error:", err);
    weatherDiv.textContent = "⚠️ Weather unavailable";
  }
}

window.addEventListener("DOMContentLoaded", loadWeather);
