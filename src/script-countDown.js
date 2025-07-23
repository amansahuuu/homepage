document.addEventListener("DOMContentLoaded", function () {
  const addButton = document.getElementById("addCountdown");
  const countdownsContainer = document.getElementById("countdownsContainer");
  let countdowns = JSON.parse(localStorage.getItem("countdowns")) || [];

  // Load existing countdowns
  function loadCountdowns() {
    countdownsContainer.innerHTML = "";
    countdowns.forEach((countdown, index) => {
      createCountdownElement(countdown, index);
    });
    startAllCountdowns();
  }

  // Create countdown element
  function createCountdownElement(countdown, index) {
    const countdownElement = document.createElement("div");
    countdownElement.className = "bg-white rounded-lg shadow-md p-6 relative";
    countdownElement.innerHTML = `
      <h3 class="text-xl font-semibold mb-2">${countdown.name}</h3>
      <p class="text-gray-600 mb-4">${new Date(
        countdown.date
      ).toLocaleString()}</p>
      <div class="grid grid-cols-4 gap-2 text-center">
        <div class="bg-gray-100 p-2 rounded">
          <div class="text-2xl font-bold days">00</div>
          <div class="text-xs text-gray-500">Days</div>
        </div>
        <div class="bg-gray-100 p-2 rounded">
          <div class="text-2xl font-bold hours">00</div>
          <div class="text-xs text-gray-500">Hours</div>
        </div>
        <div class="bg-gray-100 p-2 rounded">
          <div class="text-2xl font-bold minutes">00</div>
          <div class="text-xs text-gray-500">Minutes</div>
        </div>
        <div class="bg-gray-100 p-2 rounded">
          <div class="text-2xl font-bold seconds">00</div>
          <div class="text-xs text-gray-500">Seconds</div>
        </div>
      </div>
      <button class="delete-btn absolute top-2 right-2 text-gray-400 hover:text-red-500">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    `;
    countdownsContainer.appendChild(countdownElement);

    // Add delete functionality
    countdownElement
      .querySelector(".delete-btn")
      .addEventListener("click", () => {
        countdowns.splice(index, 1);
        localStorage.setItem("countdowns", JSON.stringify(countdowns));
        loadCountdowns();
      });
  }

  // Update countdown display
  function updateCountdown(element, targetDate) {
    const now = new Date().getTime();
    const distance = targetDate - now;

    if (distance < 0) {
      element.innerHTML =
        '<div class="text-center py-4 text-red-500">Event has passed!</div>';
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    element.querySelector(".days").textContent = days
      .toString()
      .padStart(2, "0");
    element.querySelector(".hours").textContent = hours
      .toString()
      .padStart(2, "0");
    element.querySelector(".minutes").textContent = minutes
      .toString()
      .padStart(2, "0");
    element.querySelector(".seconds").textContent = seconds
      .toString()
      .padStart(2, "0");
  }

  // Start all countdowns
  function startAllCountdowns() {
    const countdownElements = document.querySelectorAll(
      "#countdownsContainer > div"
    );

    countdownElements.forEach((element, index) => {
      const targetDate = new Date(countdowns[index].date).getTime();

      // Update immediately
      updateCountdown(element, targetDate);

      // Then update every second
      const interval = setInterval(() => {
        updateCountdown(element, targetDate);
      }, 1000);

      // Store interval ID on element for potential cleanup
      element.dataset.intervalId = interval;
    });
  }

  // Add new countdown
  addButton.addEventListener("click", function () {
    const eventName = document.getElementById("eventName").value.trim();
    const eventDate = document.getElementById("eventDate").value;

    if (!eventName || !eventDate) {
      alert("Please fill in both fields");
      return;
    }

    const newCountdown = {
      name: eventName,
      date: eventDate,
    };

    countdowns.push(newCountdown);
    localStorage.setItem("countdowns", JSON.stringify(countdowns));

    document.getElementById("eventName").value = "";
    document.getElementById("eventDate").value = "";

    loadCountdowns();
  });

  // Initial load
  loadCountdowns();
});

document.addEventListener("DOMContentLoaded", function () {
  const widgetContainer = document.getElementById("widgetCountdowns");

  // Load countdowns from localStorage (shared with main app)
  const countdowns = JSON.parse(localStorage.getItem("countdowns")) || [];

  // Display each countdown
  countdowns.forEach((countdown) => {
    const targetDate = new Date(countdown.date).getTime();
    const now = new Date().getTime();
    const distance = targetDate - now;

    if (distance < 0) return; // Skip past events

    const widgetElement = document.createElement("div");
    widgetElement.className =
      "border border-bg-grey p-1 rounded backdrop-blur-sm bg-white/30 shadow-sm ";
    widgetElement.innerHTML = `
        <div class="font-semibold ml-3 text-3xl">${countdown.name}</div>
        <div class="text-xs text-gray-500 ml-3 mb-1">${new Date(
          countdown.date
        ).toLocaleString()}</div>
        <div class="grid grid-cols-4 gap-1 text-center">
          <div>
            <div class="text-3xl font-bold days">00</div>
            <div class="text-xs text-gray-500">Days</div>
          </div>
          <div>
            <div class="text-lg font-bold hours">00</div>
            <div class="text-xs text-gray-500">Hours</div>
          </div>
          <div>
            <div class="text-lg font-bold minutes">00</div>
            <div class="text-xs text-gray-500">Minutes</div>
          </div>
          <div>
            <div class="text-lg font-bold seconds">00</div>
            <div class="text-xs text-gray-500">Seconds</div>
          </div>
        </div>
      `;
    widgetContainer.appendChild(widgetElement);

    // Update countdown
    function updateCountdown() {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        widgetElement.innerHTML = `
            <div class="font-semibold text-sm">${countdown.name}</div>
            <div class="text-xs text-gray-500">Event passed</div>
          `;
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      widgetElement.querySelector(".days").textContent = days
        .toString()
        .padStart(2, "0");
      widgetElement.querySelector(".hours").textContent = hours
        .toString()
        .padStart(2, "0");
      widgetElement.querySelector(".minutes").textContent = minutes
        .toString()
        .padStart(2, "0");
      widgetElement.querySelector(".seconds").textContent = seconds
        .toString()
        .padStart(2, "0");
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);
  });

  // Show message if no active countdowns
  if (
    countdowns.length === 0 ||
    countdowns.every((c) => new Date(c.date).getTime() < Date.now())
  ) {
    widgetContainer.innerHTML =
      '<div class="text-sm text-gray-500 text-center">No active countdowns</div>';
  }
});
