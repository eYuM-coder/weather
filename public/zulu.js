const xb = [
  // Universal Standards
  { value: "UTC", label: "UTC (Zulu)", short: "UTC", offset: "±0" },
  { value: "GMT", label: "GMT (No DST)", short: "GMT", offset: "±0" },

  // North America
  {
    value: "America/New_York",
    label: "ET — Eastern (US & Canada)",
    short: "ET",
    offset: "-5/-4",
  },
  {
    value: "America/Chicago",
    label: "CT — Central (US & Canada)",
    short: "CT",
    offset: "-6/-5",
  },
  {
    value: "America/Denver",
    label: "MT — Mountain (US & Canada)",
    short: "MT",
    offset: "-7/-6",
  },
  {
    value: "America/Los_Angeles",
    label: "PT — Pacific (US & Canada)",
    short: "PT",
    offset: "-8/-7",
  },
  {
    value: "America/Phoenix",
    label: "Arizona (No DST)",
    short: "MST",
    offset: "-7",
  },
  {
    value: "America/Anchorage",
    label: "AKT — Alaska",
    short: "AKT",
    offset: "-9/-8",
  },
  {
    value: "Pacific/Honolulu",
    label: "HST — Hawaii",
    short: "HST",
    offset: "-10",
  },

  // Europe
  {
    value: "Europe/London",
    label: "UK — London (GMT/BST)",
    short: "UK",
    offset: "±0/+1",
  },
  {
    value: "Europe/Paris",
    label: "Europe — Paris (CET/CEST)",
    short: "CET",
    offset: "+1/+2",
  },
  {
    value: "Europe/Berlin",
    label: "Germany — Berlin (CET/CEST)",
    short: "CET",
    offset: "+1/+2",
  },
  {
    value: "Europe/Moscow",
    label: "Russia — Moscow",
    short: "MSK",
    offset: "+3",
  },

  // Asia
  { value: "Asia/Dubai", label: "UAE — Dubai", short: "GST", offset: "+4" },
  {
    value: "Asia/Kolkata",
    label: "India — IST",
    short: "IST",
    offset: "+5:30",
  },
  {
    value: "Asia/Kathmandu",
    label: "Nepal — NPT",
    short: "NPT",
    offset: "+5:45",
  },
  {
    value: "Asia/Shanghai",
    label: "China — Shanghai",
    short: "CST",
    offset: "+8",
  },
  { value: "Asia/Tokyo", label: "Japan — Tokyo", short: "JST", offset: "+9" },
  { value: "Asia/Seoul", label: "Korea — Seoul", short: "KST", offset: "+9" },

  // Oceania
  {
    value: "Australia/Adelaide",
    label: "Australia — Adelaide",
    short: "ACDT",
    offset: "+9:30/+10:30",
  },
  {
    value: "Australia/Sydney",
    label: "Australia — Sydney",
    short: "AEDT",
    offset: "+10/+11",
  },
  {
    value: "Pacific/Auckland",
    label: "New Zealand — Auckland",
    short: "NZDT",
    offset: "+12/+13",
  },
  {
    value: "Pacific/Chatham",
    label: "NZ — Chatham Islands",
    short: "CHADT",
    offset: "+12:45/+13:45",
  },

  // South America
  {
    value: "America/Sao_Paulo",
    label: "Brazil — São Paulo",
    short: "BRT",
    offset: "-3",
  },

  // Africa
  {
    value: "Africa/Johannesburg",
    label: "South Africa — SAST",
    short: "SAST",
    offset: "+2",
  },

  // Extreme offsets (for Zulu conversions)
  {
    value: "Etc/GMT+12",
    label: "UTC-12 (Baker/Howland)",
    short: "UTC-12",
    offset: "-12",
  },
  {
    value: "Pacific/Kiritimati",
    label: "UTC+14 — Kiritimati",
    short: "UTC+14",
    offset: "+14",
  },
];

let tzMenuOpen = false;

// ========================================
// RADIX-LIKE TIMEZONE MENU (CUSTOM)
// ========================================

// Elements
const tzMenuButton = document.getElementById("tzMenuButton");
const tzMenuDropdown = document.getElementById("tzMenuDropdown");
const tzMenuLabel = document.getElementById("tzMenuLabel");

// Selected timezone from the dropdown (ET, PT, UK, JST, etc.)
let selectedZone = "America/New_York";

// Whether time-only mode is enabled
// (you already toggle this on your switch)
function isTimeOnlyMode() {
  return timeOnlyToggle.getAttribute("data-state") === "checked";
}

// Build menu from xb array
function buildTimezoneMenu() {
  tzMenuDropdown.innerHTML = "";

  xb.forEach((zone) => {
    const item = document.createElement("div");
    item.className =
      "cursor-pointer px-3 py-2 rounded-md text-sm text-white hover:bg-monitor-active/20 hover:text-white font-mono text-xs flex justify-between";
    item.dataset.value = zone.value;
    item.innerHTML = `
        <span>${zone.label}</span>
        <span class="text-gray-500">${"UTC" + zone.offset}</span>
    `;

    item.addEventListener("click", () => {
      applyTimezoneSelection(zone);
      closeTZMenu();
    });

    tzMenuDropdown.appendChild(item);
  });
}

function applyTimezoneSelection(zone) {
  selectedZone = zone.value;

  // update button label
  tzMenuLabel.innerHTML = `
      <span>${zone.label}</span>
      <span class="text-xs text-white/50 ml-2">UTC${zone.offset}</span>
  `;

  // update the converter offset
  updateConverterOffset(zone);
  updateQuickButtons();
}

function openTZMenu() {
  const menu = tzMenuDropdown;

  menu.classList.remove("hidden");
  menu.classList.remove("tzMenuExitActive", "tzMenuExit");

  menu.classList.add("tzMenuEnter");

  requestAnimationFrame(() => {
    menu.classList.add("tzMenuEnterActive");
  });

  // Remove enter classes after animation finishes
  setTimeout(() => {
    menu.classList.remove("tzMenuEnter", "tzMenuEnterActive");
  }, 150);
}

function closeTZMenu() {
  const menu = tzMenuDropdown;

  menu.classList.remove("tzMenuEnter", "tzMenuEnterActive");
  menu.classList.add("tzMenuExit");

  requestAnimationFrame(() => {
    menu.classList.add("tzMenuExitActive");
  });

  tzMenuOpen = false;

  setTimeout(() => {
    menu.classList.remove("tzMenuExit", "tzMenuExitActive");
    menu.classList.add("hidden");
  }, 120);
}

tzMenuButton.addEventListener("click", () => {
  if (tzMenuDropdown.classList.contains("hidden")) openTZMenu();
  else closeTZMenu();
});

// Close dropdown when clicking outside
document.addEventListener("click", (e) => {
  if (!tzMenuButton.contains(e.target) && !tzMenuDropdown.contains(e.target)) {
    closeTZMenu();
  }
});

document.querySelectorAll("[data-collapse]").forEach((section) => {
  const button = section.querySelector("button");
  const content = button.nextElementSibling;
  const chevron = button.querySelector(".lucide-chevron-right");

  button.addEventListener("click", () => {
    const isOpen = content.classList.toggle("open");

    if (isOpen) {
      content.classList.remove("max-h-0");
      content.classList.add(`max-h-[5000px]`, "mt-6");
    } else {
      content.classList.add("max-h-0");
      content.classList.remove("max-h-[5000px]", "mt-6");
    }

    if (chevron) {
      chevron.style.transition = "transform 0.3s ease";
      chevron.style.transform = isOpen ? "rotate(90deg)" : "rotate(0deg)";
    }
  });
});

// ---------------------------
// DST + OFFSET HANDLING
// ---------------------------
let tzOffsetHours = 5; // ET default (std)
let tzUsesDST = true;

// Convert xb offset string to numbers
function updateConverterOffset(zone) {
  let off = zone.offset; // "-5/-4" for ET

  if (off.includes("/")) {
    const [std, dst] = off
      .split("/")
      .map((v) => parseInt(v.replace("UTC", "")));
    tzUsesDST = true;

    // detect DST using OS rules
    const now = new Date();
    const jan = new Date(now.getFullYear(), 0, 1).getTimezoneOffset();
    const jul = new Date(now.getFullYear(), 6, 1).getTimezoneOffset();
    const systemDST = Math.min(jan, jul) === now.getTimezoneOffset();

    tzOffsetHours = (systemDST ? dst : std) * -1;
  } else if (zone.short === "UTC") {
    tzOffsetHours = 0;
  } else {
    tzUsesDST = false;
    tzOffsetHours = parseInt(off);
  }
}

// ---------------------------
// QUICK PICK BUTTONS
// ---------------------------
const tzQuickInactive =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-accent h-9 rounded-md px-3 text-xs font-mono border border-monitor-border/50 text-gray-500 hover:text-white bg-monitor-bg/30";
const tzQuickActive =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3 text-xs font-mono border bg-monitor-active/20 text-monitor-active border-monitor-active/50";

function updateQuickButtons() {
  document.querySelectorAll(".tzQuick").forEach((btn) => {
    const code = btn.id.replace("tz", ""); // MUCH better than ID parsing
    const match = xb.find((x) => x.short === code);

    if (match && match.value === selectedZone) {
      btn.className = `tzQuick ${tzQuickActive}`;
    } else {
      btn.className = `tzQuick ${tzQuickInactive}`;
    }
  });
}

document.querySelectorAll(".tzQuick").forEach((btn) => {
  btn.addEventListener("click", () => {
    const code = btn.id.replace("tz", ""); // "ET"
    const zone = xb.find((x) => x.short === code);

    applyTimezoneSelection(zone);
    updateQuickButtons();
  });
});

// build menu initially
buildTimezoneMenu();

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

// ===============================
// LIVE TIME DISPLAYS
// ===============================

const timezoneTargets = {
  zulu: document.getElementById("currentZulu"),
  et: document.getElementById("easternTime"),
  pt: document.getElementById("pacificTime"),
  uk: document.getElementById("unitedKingdomTime"),
  jst: document.getElementById("JSTTime"),
};

const zones = {
  zulu: "UTC",
  et: "America/New_York",
  pt: "America/Los_Angeles",
  uk: "Europe/London",
  jst: "Asia/Tokyo",
};

let lastRendered = {};
let zuluFormat = "weather24";

// ===============================
// OUTPUT FORMAT BUTTONS
// ===============================

const zuluButtons = {
  iso: "btnISO",
  isoShort: "btnISOShort",
  weather24: "btnWeather24",
  weather12: "btnWeather12",
  military: "btnMilitary",
  aviation: "btnAviation",

  // EXTENDED FORMATS
  nwsAfd: "btnNwsAfd",
  ddhhmmZ: "btnDDHHMMZ",
  julianShort: "btnJulianShort",
  julianLong: "btnJulianLong",
  synoptic: "btnSynoptic",
  bufr: "btnBufr",
  w3c: "btnW3C",
  rfc822: "btnRFC822",
  unix: "btnUnix",
  epochMs: "btnEpochMs",
  nwsHeader: "btnNwsHeader",
  sameGroup: "btnSameGroup",
};

function setZuluFormat(mode) {
  zuluFormat = mode;

  const inactive =
    "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 rounded-md px-3 text-xs font-mono h-7 text-gray-500 hover:text-gray-300 hover:bg-white/5";

  const active =
    "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground rounded-md px-3 text-xs font-mono h-7 bg-monitor-active/20 text-monitor-active border border-monitor-active/30";

  // Reset all to inactive
  for (const [format, id] of Object.entries(zuluButtons)) {
    const btn = document.getElementById(id);
    if (!btn) continue;
    btn.setAttribute("class", inactive);
  }

  // Apply active style to the chosen mode
  const activeBtn = document.getElementById(zuluButtons[mode]);
  if (activeBtn) activeBtn.setAttribute("class", active);

  updateTimes();
  convertLocalToZulu();
}

function getJulianDay(date) {
  const start = new Date(Date.UTC(date.getUTCFullYear(), 0, 0));
  const diff = date - start;
  return Math.floor(diff / 86400000);
}

function formatZulu(date, mode = zuluFormat) {
  const yyyy = date.getUTCFullYear();
  const MM = String(date.getUTCMonth() + 1).padStart(2, "0");
  const DD = String(date.getUTCDate()).padStart(2, "0");

  const H = date.getUTCHours(); // numeric hour
  const HH = String(H).padStart(2, "0"); // string padded hour
  const mm = String(date.getUTCMinutes()).padStart(2, "0");
  const ss = String(date.getUTCSeconds()).padStart(2, "0");
  const ms = String(date.getUTCMilliseconds()).padStart(3, "0");

  const h12n = H % 12 === 0 ? 12 : H % 12; // numeric 12h
  const hh = String(h12n).padStart(2, "0"); // string padded 12h

  const suffix = H < 12 ? "AM" : "PM";

  const MON = [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC",
  ][date.getUTCMonth()];

  const MONTHS_LONG = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Julian day (001–366)
  const start = new Date(Date.UTC(yyyy, 0, 0));
  const diff = date - start;
  const julian = Math.floor(diff / 86400000);
  const julian3 = String(julian).padStart(3, "0");

  switch (mode) {
    // BASIC MODES
    case "weather24":
      return `${yyyy}-${MM}-${DD} ${HH}:${mm}:${ss}Z`;

    case "weather12":
    case "weather12hr":
      return `${yyyy}-${MM}-${DD} ${hh}:${mm}:${ss} ${suffix}Z`;

    case "iso":
      return `${yyyy}-${MM}-${DD}T${HH}:${mm}:${ss}.${ms}Z`;

    case "isoShort":
      return `${yyyy}-${MM}-${DD}T${HH}:${mm}Z`;

    case "military":
      return `${DD} ${HH}${mm}Z ${MON} ${String(yyyy).slice(-2)}`;

    case "aviation":
      return `${DD}${HH}${mm}Z`;

    case "nwsAfd":
      return `${DD} ${MON} ${yyyy} ${HH}${mm}Z`;

    case "ddhhmmZ":
      return `${DD}${HH}${mm}Z`;

    case "julianShort":
      return `${julian3}/${HH}${mm}Z`;

    // Julian (long — NOAA/NASA)
    case "julianLong":
      return `${yyyy}.${julian3}.${HH}${mm}Z`;

    // Synoptic time (no Z suffix, implied UTC)
    case "synoptic":
      return `${DD}${HH}${mm}`;

    // BUFR-like time groups
    case "bufr":
      return `${String(yyyy).slice(2)} ${MM} ${DD} ${HH} ${mm}`;

    // W3C / RFC3339 (no milliseconds)
    case "w3c":
      return `${yyyy}-${MM}-${DD}T${HH}:${mm}:${ss}Z`;

    // RFC822 / email / HTTP headers
    case "rfc822":
      return `${
        ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][date.getUTCDay()]
      }, ${DD} ${
        MONTHS_LONG[date.getUTCMonth()]
      } ${yyyy} ${HH}:${mm}:${ss} +0000`;

    // Unix timestamps
    case "unix":
      return Math.floor(date.getTime() / 1000);

    // Epoch milliseconds
    case "epochMs":
      return date.getTime();

    // NWS bulletin timestamp (WWUS84, etc.)
    case "nwsHeader":
      return `${DD}${HH}${mm}`;

    // SAME time group (JJJHHMM)
    case "sameGroup":
      return `${julian3}${HH}${mm}`;

    // FALLBACK
    default:
      return `${yyyy}-${MM}-${DD} ${HH}:${mm}:${ss}Z`;
  }
}

function formatAllZulu(date) {
  const yyyy = date.getUTCFullYear();
  const MM = String(date.getUTCMonth() + 1).padStart(2, "0");
  const DD = String(date.getUTCDate()).padStart(2, "0");

  const H = date.getUTCHours(); // numeric hour
  const HH = String(H).padStart(2, "0"); // padded hour string
  const mm = String(date.getUTCMinutes()).padStart(2, "0");
  const ss = String(date.getUTCSeconds()).padStart(2, "0");
  const ms = String(date.getUTCMilliseconds()).padStart(3, "0");

  const h12n = H % 12 === 0 ? 12 : H % 12; // numeric 12h
  const hh = String(h12n).padStart(2, "0"); // padded 12h
  const suffix = H < 12 ? "AM" : "PM";

  const MON = [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC",
  ][date.getUTCMonth()];

  const MONTHS_LONG = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Julian day (001–366)
  const start = new Date(Date.UTC(yyyy, 0, 0));
  const diff = date - start;
  const julian = Math.floor(diff / 86400000);
  const julian3 = String(julian).padStart(3, "0");

  return {
    // =========================
    // PRIMARY FORMATS (match buttons)
    // =========================
    weather24: `${yyyy}-${MM}-${DD} ${HH}:${mm}:${ss}Z`,
    weather12: `${yyyy}-${MM}-${DD} ${hh}:${mm}:${ss} ${suffix}Z`,
    iso: `${yyyy}-${MM}-${DD}T${HH}:${mm}:${ss}.${ms}Z`,
    isoShort: `${yyyy}-${MM}-${DD}T${HH}:${mm}Z`,
    military: `${DD} ${HH}${mm}Z ${MON} ${String(yyyy).slice(-2)}`,
    aviation: `${DD}${HH}${mm}Z`,

    // =========================
    // EXTENDED FORMATS
    // =========================

    // NWS AFD format (DISCUSSION headers)
    nwsAfd: `${DD} ${MON} ${yyyy} ${HH}${mm}Z`,

    // NWS DDHHMMZ format
    ddhhmmZ: `${DD}${HH}${mm}Z`,

    // Julian (short)
    julianShort: `${julian3}/${HH}${mm}Z`,

    // Julian (long — NOAA/NASA)
    julianLong: `${yyyy}.${julian3}.${HH}${mm}Z`,

    // Synoptic time (no Z suffix, implied UTC)
    synoptic: `${DD}${HH}${mm}`,

    // BUFR-like time groups
    bufr: `${String(yyyy).slice(2)} ${MM} ${DD} ${HH} ${mm}`,

    // W3C / RFC3339 (no milliseconds)
    w3c: `${yyyy}-${MM}-${DD}T${HH}:${mm}:${ss}Z`,

    // RFC822 / email / HTTP headers
    rfc822: `${
      ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][date.getUTCDay()]
    }, ${DD} ${
      MONTHS_LONG[date.getUTCMonth()]
    } ${yyyy} ${HH}:${mm}:${ss} +0000`,

    // Unix timestamps
    unix: Math.floor(date.getTime() / 1000),

    // Epoch milliseconds
    epochMs: date.getTime(),

    // NWS bulletin timestamp (WWUS84, etc.)
    nwsHeader: `${DD}${HH}${mm}`,

    // SAME time group (JJJHHMM)
    sameGroup: `${julian3}${HH}${mm}`,
  };
}

function formatPretty(date, zone) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: zone,
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).format(date);
}

function updateTimes() {
  const now = new Date();

  const z = formatZulu(now);
  if (z !== lastRendered.zulu) {
    lastRendered.zulu = z;
    timezoneTargets.zulu.textContent = z;
  }

  ["et", "pt", "uk", "jst"].forEach((t) => {
    const val = formatPretty(now, zones[t]);
    if (val !== lastRendered[t]) {
      lastRendered[t] = val;
      timezoneTargets[t].textContent = val;
    }
  });

  requestAnimationFrame(updateTimes);
}

updateTimes();

// ===============================
// LOCAL → ZULU CONVERTER LOGIC
// ===============================

const timeOnlyToggle = document.getElementById("timeOnly");
let datetimeInput =
  document.getElementById("datetime") || document.getElementById("time");
const convertButton = document.getElementById("btnConvertToZulu");

const presetNow = document.getElementById("btnPresetNow");
const preset0800 = document.getElementById("btnPreset0800");
const preset2000 = document.getElementById("btnPreset2000");

const dateInputContainer = datetimeInput.closest(".space-y-2");
let timeSetting;
let datetimeSetting;

function getDatetimeInput() {
  return document.getElementById("datetime") || document.getElementById("time");
}

// ===============================
// TIME-ONLY MODE TOGGLE
// ===============================

function attachInputWatcher() {
  const input = getDatetimeInput();
  if (!input) return;

  input.addEventListener("input", () => {
    if (input.id === "time") {
      timeSetting = input.value;
    } else {
      datetimeSetting = input.value;
    }
  });
}

timeOnlyToggle.addEventListener("click", () => {
  const isChecked = timeOnlyToggle.getAttribute("data-state") === "checked";
  const next = isChecked ? "unchecked" : "checked";

  timeOnlyToggle.setAttribute("data-state", next);
  timeOnlyToggle.querySelector("span").setAttribute("data-state", next);

  if (next === "checked") {
    dateInputContainer.innerHTML = `
        <label
          class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          for="time"
        >
          Time
        </label>
        <input
          type="time"
          class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm font-mono"
          id="time"
          value="${timeSetting ?? ""}"
        ></input>
        <div class="text-xs text-white/50">
          Assumes today's date in the selected timezone.
        </div>`;
  } else {
    dateInputContainer.innerHTML = `
        <label
          class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          for="datetime"
        >
          Date &amp; Time
        </label>
        <input
          type="datetime-local"
          class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm font-mono"
          id="datetime"
          value="${datetimeSetting ?? ""}"
        ></input>
        <div class="text-xs text-white/50">
          Enter the local wall-clock date and time.
        </div>`;
  }
  datetimeInput = getDatetimeInput();

  attachInputWatcher();
});

attachInputWatcher();

// ===============================
// PRESET BUTTONS
// ===============================

function applyPresetTime(hour, minute = 0) {
  const hh = String(hour).padStart(2, "0");
  const mm = String(minute).padStart(2, "0");

  // TIME-ONLY MODE → only hour/min displayed
  if (isTimeOnlyMode()) {
    datetimeInput.value = `${hh}:${mm}`;
    timeSetting = `${hh}:${mm}`;
    return;
  }

  // FULL DATETIME MODE → today + selected time
  const now = new Date(new Date().toLocaleString("en-US"));

  const yyyy = now.getFullYear();
  const MM = String(now.getMonth() + 1).padStart(2, "0");
  const DD = String(now.getDate()).padStart(2, "0");

  datetimeInput.value = `${yyyy}-${MM}-${DD}T${hh}:${mm}`;
  datetimeSetting = `${yyyy}-${MM}-${DD}T${hh}:${mm}`;
}

function applyNow() {
  const now = new Date(new Date().toLocaleString("en-US"));

  const yyyy = now.getFullYear();
  const MM = String(now.getMonth() + 1).padStart(2, "0");
  const DD = String(now.getDate()).padStart(2, "0");
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");

  if (isTimeOnlyMode()) {
    datetimeInput.value = `${hh}:${mm}`;
    timeSetting = `${hh}:${mm}`;
  } else {
    datetimeInput.value = `${yyyy}-${MM}-${DD}T${hh}:${mm}`;
    datetimeSetting = `${yyyy}-${MM}-${DD}T${hh}:${mm}`;
  }
}

presetNow.onclick = () => {
  applyNow(); // Uses selectedZone + time-only-mode correctly
};

preset0800.onclick = () => {
  applyPresetTime(8, 0);
};

preset2000.onclick = () => {
  applyPresetTime(20, 0);
};

function getOtherZuluFormats(date) {
  const all = formatAllZulu(date);

  // Remove the currently selected one
  delete all[zuluFormat];

  return all;
}

// ===============================
// CONVERSION
// ===============================
const converterOutput = document.getElementById("converterOutput");

// ---- Helpers: parse user input ----
function parseLocalDateTime(raw) {
  // "2025-12-02T18:00"
  if (!raw) return null;
  const [datePart, timePart] = raw.split("T");
  if (!datePart || !timePart) return null;

  const [year, month, day] = datePart.split("-").map((n) => parseInt(n, 10));
  const [hour, minute] = timePart.split(":").map((n) => parseInt(n, 10));

  if ([year, month, day, hour, minute].some((n) => Number.isNaN(n))) {
    return null;
  }

  return { year, month, day, hour, minute };
}

function parseLocalTimeOnly(raw) {
  // "18:00"
  if (!raw) return null;
  const [hour, minute] = raw.split(":").map((n) => parseInt(n, 10));
  if ([hour, minute].some((n) => Number.isNaN(n))) return null;
  return { hour, minute };
}

// ---- Helpers: timezone math (ported from RHY logic) ----

// Compute offset (in minutes) between UTC and `timeZone` at UTC ms `utcMs`
function getOffsetMinutes(timeZone, utcMs) {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const parts = dtf.formatToParts(new Date(utcMs));
  const map = {};
  for (const p of parts) {
    map[p.type] = p.value;
  }

  const year = Number(map.year);
  const month = Number(map.month) || 1;
  const day = Number(map.day) || 1;
  const hour = Number(map.hour) || 0;
  const minute = Number(map.minute) || 0;
  const second = Number(map.second) || 0;

  // This is "what that zoned time would be as UTC"
  const asUTC = Date.UTC(year, month - 1, day, hour, minute, second);

  // Difference (in minutes) between that and the original UTC ms
  return Math.round((asUTC - utcMs) / 60000);
}

// Convert a "local" time in a given zone → a real UTC Date
// parts = { year, month, day, hour, minute }
function localToUTCFromParts(parts, timeZone) {
  // Treat local time as if it's UTC first
  const utcGuess = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    0
  );

  let offset = getOffsetMinutes(timeZone, utcGuess);
  let finalMs = utcGuess - offset * 60000;

  // Recheck offset at that moment (handles DST edges cleanly)
  const offset2 = getOffsetMinutes(timeZone, finalMs);
  if (offset2 !== offset) {
    finalMs = utcGuess - offset2 * 60000;
  }

  return new Date(finalMs);
}

// Get today's {year, month, day} in a given zone
function getZoneDateParts(timeZone, utcMs) {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const parts = dtf.formatToParts(new Date(utcMs));
  const map = {};
  for (const p of parts) {
    map[p.type] = p.value;
  }

  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
  };
}

function labelDisplay(key) {
  switch (key) {
    case "weather12":
      return "Zulu (Weather 12hr)";
    case "weather24":
      return "Zulu (Weather)";
    case "iso":
      return "ISO";
    case "isoShort":
      return "ISO Short";
    case "military":
      return "Military";
    case "aviation":
      return "Aviation";
    case "nwsAfd":
      return "NWS AFD";
    case "ddhhmmZ":
      return "DDHHMMZ";
    case "julianShort":
      return "Julian Short";
    case "julianLong":
      return "Julian Long";
    case "synoptic":
      return "Synoptic";
    case "bufr":
      return "BUFR";
    case "w3c":
      return "W3C";
    case "rfc822":
      return "RFC822";
    case "unix":
      return "Unix";
    case "epochMs":
      return "Epoch MS";
    case "nwsHeader":
      return "NWS Header";
    case "sameGroup":
      return "SAME Group";
  }
}

// ---- Shared HTML blocks (keep your styling) ----
function renderResultCard(message, utcDate) {
  const others = getOtherZuluFormats(utcDate);

  converterOutput.innerHTML = `
  <div class="rounded-lg border border-monitor-active/30 bg-gradient-to-r from-monitor-active/10 to-monitor-bg p-4 relative overflow-hidden">
    <div class="absolute top-0 right-0 w-24 h-24 bg-monitor-active/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
    <div class="flex items-center justify-between mb-2 relative z-10">
      <div class="text-xs font-bold text-monitor-active font-tech uppercase tracking-wide">Calculation Result</div>
      <button class="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 rounded-md px-3 h-6 text-monitor-active hover:text-white hover:bg-monitor-active/20">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-copy w-4 h-4">
          <rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect>
          <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
        </svg>
      </button>
    </div>

    <div class="text-2xl md:text-3xl font-bold font-mono break-all text-white relative z-10 drop-shadow-[0_0_5px_rgba(56,189,248,0.5)]">
      ${formatZulu(utcDate)}
    </div>

    <div class="mt-4 pt-3 border-t border-monitor-active/20 space-y-1 relative z-10">
      <div class="text-[10px] text-gray-500 font-mono uppercase mb-2">Alternate Formats</div>

      ${Object.entries(others)
        .map(
          ([label, value]) => `
            <div class="flex items-center justify-between text-xs font-mono">
              <span class="text-gray-500">${labelDisplay(label)}:</span>
              <span class="text-gray-300">${value}</span>
            </div>`
        )
        .join("")}
    </div>
  </div>
`;
}

// ===============================
//    LOCAL → ZULU CONVERTER
// ===============================
function convertLocalToZulu() {
  const raw = datetimeInput.value.trim();

  if (!raw) {
    renderResultCard("Please enter date and time or switch to time-only mode.");
    return;
  }

  let utcDate;

  try {
    if (isTimeOnlyMode()) {
      // TIME-ONLY MODE: "HH:MM" in selectedZone, for TODAY in that zone
      const timeParts = parseLocalTimeOnly(raw);
      if (!timeParts) {
        renderResultCard("Please enter a valid time (HH:MM).");
        return;
      }

      const nowUtcMs = Date.now();
      const dateParts = getZoneDateParts(selectedZone, nowUtcMs);

      const localParts = {
        year: dateParts.year,
        month: dateParts.month,
        day: dateParts.day,
        hour: timeParts.hour,
        minute: timeParts.minute,
      };

      utcDate = localToUTCFromParts(localParts, selectedZone);
    } else {
      // FULL DATETIME: "YYYY-MM-DDTHH:MM" in selectedZone
      const localParts = parseLocalDateTime(raw);
      if (!localParts) {
        renderResultCard(
          "Please enter date and time in YYYY-MM-DDTHH:MM format."
        );
        return;
      }

      utcDate = localToUTCFromParts(localParts, selectedZone);
    }
  } catch (err) {
    console.error("Conversion error:", err);
    renderResultCard("Conversion failed. Try a different time or timezone.");
    return;
  }

  const formatted = formatZulu(utcDate);
  renderResultCard(formatted, utcDate);
}

convertButton.onclick = convertLocalToZulu;

window.addEventListener("resize", () => {
  if (menuOpen) positionToolsMenu();
});

for (const [format, id] of Object.entries(zuluButtons)) {
  const btn = document.getElementById(id);
  if (!btn) continue;

  btn.addEventListener("click", () => setZuluFormat(format));
}
