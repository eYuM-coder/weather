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

document.querySelectorAll("[data-collapse]").forEach((section) => {
  const button = section.querySelector("button");
  const content = button.parentElement.nextElementSibling;
  const chevron = button.querySelector(".lucide-chevron-right");

  button.addEventListener("click", () => {
    const isOpen = content.classList.toggle("open");

    if (isOpen) {
      content.classList.remove("max-h-0", "p-0");
      content.classList.add(`max-h-[5000px]`, "mt-2", "p-6", "pt-0");
    } else {
      content.classList.add("max-h-0", "p-0");
      content.classList.remove("max-h-[5000px]", "mt-2", "p-6", "pt-0");
    }

    if (chevron) {
      chevron.style.transition = "transform 0.3s ease";
      chevron.style.transform = isOpen ? "rotate(90deg)" : "rotate(0deg)";
    }
  });
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

const refreshButton = document.getElementById("refresh-button");

refreshButton.addEventListener("click", () => {
  updateScannerCards();
});

function formatTime(ts, showTimeZone = false) {
  if (!ts) return "—";
  const d = new Date(ts);
  if (isNaN(d)) return "—";

  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    ...(showTimeZone ? { timeZoneName: "short" } : {}),
  });
}

function formatTimeRange(start, end) {
  if (!start || !end) return null;

  const startTime = new Date(start);
  const endTime = new Date(end);

  if (isNaN(startTime) || isNaN(endTime)) return null;

  return `${formatTime(start)} - ${formatTime(end, true)}`;
}

function getFirstTimestamp(incident) {
  const ts = incident.timestamps?.[0];
  if (!ts) return 0;

  const d = new Date(ts);
  return isNaN(d.getTime()) ? 0 : d.getTime();
}

function pickLocationString(locations) {
  if (!locations?.length) return "";
  const county = locations.find((loc) => /county/i.test(loc));
  return county || locations.find((loc) => loc.includes(",")) || locations[0];
}

function parseLocation(incident) {
  const parts = pickLocationString(incident.locations || [])
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);

  let stateKey = "";
  let placeKey = "";

  if (parts.length >= 2) {
    const lastPart = parts[parts.length - 1].toUpperCase();
    const maybeState = /^[A-Z]{2}$/.test(lastPart) ? lastPart : "";
    if (maybeState) {
      stateKey = maybeState;
      placeKey = parts.length >= 3 ? parts[parts.length - 2] : parts[0];
    } else {
      placeKey = parts[0];
    }
  } else if (parts.length === 1) {
    placeKey = parts[0];
  }

  return {
    stateKey: stateKey || "ZZZ",
    placeKey: placeKey || "Unknown",
  };
}

function getStateName(incident) {
  const { stateKey } = parseLocation(incident);
  return stateKey === "ZZZ" ? "Unknown" : stateKey;
}

// Sort incidents: state → severity → place → timestamp
function sortIncidents(incidents) {
  return [...incidents].sort((a, b) => {
    const locA = parseLocation(a);
    const locB = parseLocation(b);

    const stateCompare = locA.stateKey.localeCompare(locB.stateKey);
    if (stateCompare !== 0) return stateCompare;

    const severityCompare = severityRank(a.severity) - severityRank(b.severity);
    if (severityCompare !== 0) return severityCompare;

    const placeCompare = locA.placeKey.localeCompare(locB.placeKey);
    if (placeCompare !== 0) return placeCompare;

    return getFirstTimestamp(b) - getFirstTimestamp(a);
  });
}

// Group incidents by state
function groupByState(incidents) {
  const sorted = sortIncidents(incidents);
  const map = new Map();

  for (const incident of sorted) {
    const state = getStateName(incident);
    if (!map.has(state)) map.set(state, []);
    map.get(state).push(incident);
  }

  return map;
}

function countSeverities(incidents) {
  let high = 0,
    medium = 0,
    low = 0;

  for (const incident of incidents) {
    const s = (incident.severity || "").toLowerCase();
    if (s === "high" || s === "severe" || s === "critical") high++;
    else if (s === "medium" || s === "moderate") medium++;
    else low++;
  }

  return { high, medium, low };
}

function severityRank(severity) {
  const s = (severity || "").toLowerCase();
  if (s === "high" || s === "severe" || s === "critical") return 0;
  if (s === "medium" || s === "moderate") return 1;
  if (s === "low" || s === "minor") return 2;
  return 3;
}

function extractState(location) {
  if (!location) return null;
  return location.split(",").pop().trim();
}

function getSeverityClasses(severity) {
  const s = (severity || "").toLowerCase();

  if (s === "high" || s === "severe" || s === "critical") {
    return "text-red-400 bg-red-500/10 border-red-500/20";
  } else if (s === "medium" || s === "moderate") {
    return "text-amber-400 bg-amber-500/10 border-amber-500/20";
  } else {
    return "text-green-400 bg-green-500/10 border-green-500/20";
  }
}

function getSeverityBorder(severity) {
  const s = (severity || "").toLowerCase();

  if (s === "high" || s === "severe" || s === "critical")
    return "border-l-red-500";
  if (s === "medium" || s === "moderate") return "border-l-amber-500";
  return "border-l-green-500";
}

async function updateScannerCards() {
  const res = await fetch(
    `https://public.yallsoft.app/rhy/scanners.json?t=${new Date().getTime()}`,
  );
  const data = await res.json();

  const scannerTransmissionsEl = document.getElementById(
    "scannerTransmissions",
  );
  const notableTransmissionsEl = document.getElementById("notableEvents");
  const lowSeverityEl = document.getElementById("lowSeverity"),
    mediumSeverityEl = document.getElementById("mediumSeverity"),
    highSeverityEl = document.getElementById("highSeverity");
  const updatedTimestamp = document.getElementById("scannerUpdatedTimestamp");
  const updateWindowTimestamps = document.getElementById("scannerUpdateWindow");
  const trafficAnalysisEl = document.getElementById("scannerTrafficAnalysis");
  const keyIncidentsEl = document.getElementById("scannerIncidents");
  const noScannerIncidentsEl = document.getElementById(
    "noScannerIncidentsDetected",
  );
  const scannerIncidentContainerEl = document.getElementById(
    "scannerIncidentContainer",
  );
  const incidentCounts = countSeverities(data?.key_incidents);

  scannerTransmissionsEl.textContent = data?.transmissions_analyzed;
  notableTransmissionsEl.textContent = data?.key_incidents?.length;
  lowSeverityEl.textContent = incidentCounts.low;
  mediumSeverityEl.textContent = incidentCounts.medium;
  highSeverityEl.textContent = incidentCounts.high;
  updatedTimestamp.textContent = `${formatTime(data?.summary_timestamp, true)}`;
  updateWindowTimestamps.textContent =
    data?.analysis_period?.start || data?.analysis_period?.end
      ? `Window: ${formatTime(
          data?.analysis_period?.start,
        )} - ${formatTime(data?.analysis_period?.end)}`
      : "Last Update";
  trafficAnalysisEl.innerHTML = `
    <span
      class="font-bold text-monitor-active font-mono text-xs uppercase block mb-1"
    >
      > SITUATION SUMMARY:
    </span>
    ${data?.overall_summary}
  `;

  const grouped = groupByState(data?.key_incidents);

  keyIncidentsEl.innerHTML = Array.from(grouped.entries())
    .map(([stateKey, incidents]) => {
      const stateAbbr = stateKey === "ZZZ" ? "Unknown" : stateKey;
      const count = incidents.length;

      return `
      <div>
        <!-- State header -->
        <div class="flex items-center gap-2 mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin w-4 h-4 text-monitor-active">
            <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          <h3 class="text-lg font-bold text-white font-tech uppercase tracking-wide">${stateAbbr}</h3>
          <div class="inline-flex items-center rounded-full font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:bg-secondary/80 bg-monitor-card border border-monitor-border text-gray-400 text-[10px] px-1.5 py-0 font-mono">${count}</div>
        </div>

        <!-- Incident cards for this state -->
        <div class="space-y-3">
          ${incidents
            .map((incident) => {
              const severityClass = getSeverityClasses(incident.severity);
              const severityBorder = getSeverityBorder(incident.severity);
              const severityText = (incident.severity || "INFO").toUpperCase();
              const time = incident.timestamps?.[0]
                ? formatTime(incident.timestamps[0], true)
                : "—";

              const locationTags = (incident.locations || [])
                .map(
                  (
                    loc,
                  ) => `<span class="inline-flex items-center text-[10px] text-gray-400 bg-monitor-bg border border-monitor-border/30 px-2 py-1 rounded font-mono uppercase">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin w-3 h-3 mr-1 text-zinc-500">
                      <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    ${loc}
                  </span>`,
                )
                .join("");

              const scannerSources = (incident.scanner_sources || []).join(
                " • ",
              );

              return `
                <div class="rounded-lg border border-monitor-border/30 bg-monitor-card/50 p-4 border-l-4 transition-all hover:bg-monitor-card hover:border-monitor-border/60 hover:shadow-lg ${severityBorder}">
                  <div class="flex items-start justify-between gap-3 mb-2">
                    <div class="flex items-center gap-2 flex-wrap">
                      <div class="inline-flex items-center rounded-full border font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-[10px] px-1.5 py-0 font-mono uppercase tracking-tight ${severityClass}">${severityText}</div>
                      <span class="text-sm font-bold text-white font-tech uppercase tracking-wide">${incident.type}</span>
                    </div>
                    <div class="text-[10px] text-gray-500 whitespace-nowrap font-mono">${time}</div>
                  </div>
                  <p class="text-sm text-gray-400 leading-relaxed font-sans">${incident.description}</p>
                  <div class="flex flex-wrap gap-1.5 mt-3">${locationTags}</div>
                  <div class="mt-3 pt-3 border-t border-monitor-border/20">
                    <div class="flex items-center gap-1.5 text-[10px] text-gray-600 font-mono">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-radio w-3 h-3">
                        <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"></path>
                        <path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5"></path>
                        <circle cx="12" cy="12" r="2"></circle>
                        <path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5"></path>
                        <path d="M19.1 4.9C23 8.8 23 15.1 19.1 19"></path>
                      </svg>
                      <span>${scannerSources}</span>
                    </div>
                  </div>
                </div>
              `;
            })
            .join("")}
        </div>
      </div>
    `;
    })
    .join("");

  if (grouped.size > 0) {
    scannerIncidentContainerEl.classList.toggle("hidden", false);
    noScannerIncidentsEl.classList.toggle("hidden", true);
  } else {
    scannerIncidentContainerEl.classList.toggle("hidden", true);
    noScannerIncidentsEl.classList.toggle("hidden", false);
  }
}

function startWeatherUI() {
  updateScannerCards();

  setInterval(() => {
    updateScannerCards();
  }, 10000);
}

startWeatherUI();

window.addEventListener("resize", () => {
  if (menuOpen) positionToolsMenu();
});
