// ===============================
// TOOL MENU DROPDOWN
// ===============================

const toolsButton = document.getElementById("toolsButton");
const toolsMenu = document.getElementById("toolsMenu");

let menuOpen = false;

// Open / Close Menu
toolsButton.addEventListener("click", (e) => {
  e.stopPropagation();

  menuOpen = !menuOpen;

  if (menuOpen) {
    openToolsMenu();
  } else {
    closeToolsMenu();
  }
});

function positionToolsMenu() {
  const rect = toolsButton.getBoundingClientRect();

  toolsMenu.style.position = "fixed";
  toolsMenu.style.left = `${Math.round(rect.left) - Math.round(rect.width / 2)}px`;
  toolsMenu.style.top = `55px`;
  toolsMenu.style.zIndex = `50`;
}

positionToolsMenu();

function openToolsMenu() {
  positionToolsMenu(); // recalc every time
  toolsButton.setAttribute("data-state", "open");
  toolsMenu.setAttribute("data-state", "open");

  toolsMenu.classList.remove("hidden");

  rotateChevron(true);
}

function closeToolsMenu() {
  toolsButton.setAttribute("data-state", "closed");
  toolsMenu.setAttribute("data-state", "closed");
  // small delay for animation
  setTimeout(() => {
    toolsMenu.classList.add("hidden");
  }, 120);

  rotateChevron(false);
  menuOpen = false;
}

// Close menu on outside click
document.addEventListener("click", (e) => {
  if (!menuOpen) return;

  if (!toolsMenu.contains(e.target) && !toolsButton.contains(e.target)) {
    closeToolsMenu();
  }
});

// Chevron rotation
function rotateChevron(open) {
  const svg = toolsButton.querySelector(".lucide-chevron-down");
  svg.style.transition = "transform 0.15s ease";
  svg.style.transform = open ? "rotate(180deg)" : "rotate(0deg)";
}

// Optional: Escape key closes it
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && menuOpen) closeToolsMenu();
});

// submit.js

// Try to wire up immediately
setupSubmitRedirect();

// Fallback: if elements aren't there yet for some reason, retry a couple times
let submitSetupTries = 0;
const submitSetupMaxTries = 10;
const submitSetupInterval = setInterval(() => {
  submitSetupTries++;
  if (setupSubmitRedirect() || submitSetupTries >= submitSetupMaxTries) {
    clearInterval(submitSetupInterval);
  }
}, 150);

function setupSubmitRedirect() {
  const link = document.getElementById("submitRedirectBtn");
  const loadBox = document.getElementById("submitLoadBox");
  const loadText = document.getElementById("submitLoadText");

  if (!link || !loadBox || !loadText) {
    // DOM not ready / elements not in this route yet
    return false;
  }

  const funnyMessages = [
    "Spinning up the radar dish…",
    "Warming up the weather satellites…",
    "Calibrating the Y’all-O-Meter…",
    "Convincing the clouds to cooperate…",
    "Checking for storm chasers in chat…",
    "Almost there…",
  ];

  link.addEventListener("click", (e) => {
    e.preventDefault(); // stop default <a> nav

    // Show the message box
    loadBox.style.opacity = "1";

    let idx = 0;
    loadText.textContent = funnyMessages[idx];

    const cycle = setInterval(() => {
      idx = (idx + 1) % funnyMessages.length;
      loadText.textContent = funnyMessages[idx];
    }, 700);

    // After a short delay, open RHY's submit page in a new tab
    setTimeout(() => {
      clearInterval(cycle);
      window.open("https://www.ryanhallyall.com/submit", "_blank");

      // 🔥 NEW: Clearer message after redirect attempt
      loadText.textContent =
        "If nothing opened, your browser may be taking a moment. If it doesn’t open at all, simply click the button again to retry — the server may be temporarily slow.";
    }, 1600);
  });

  console.log("✅ submit redirect wired");
  return true;
}

window.addEventListener("resize", () => {
  if (menuOpen) positionToolsMenu();
});
