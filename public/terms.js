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

  toolsMenu.style.left = `${rect.left}px`;
  toolsMenu.style.top = `${rect.bottom + 4}px`;
}

function openToolsMenu() {
  positionToolsMenu(); // recalc every time

  toolsMenu.classList.remove("hidden");
  toolsMenu.style.opacity = "0";
  toolsMenu.style.transform = "scale(0.95)";

  requestAnimationFrame(() => {
    toolsMenu.style.opacity = "1";
    toolsMenu.style.transform = "scale(1)";
  });

  rotateChevron(true);
}

function closeToolsMenu() {
  toolsMenu.style.opacity = "0";
  toolsMenu.style.transform = "scale(0.95)";

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
