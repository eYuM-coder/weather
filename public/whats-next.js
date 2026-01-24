// ===============================
// TOOL MENU DROPDOWN
// ===============================

const toolsButton = document.getElementById("toolsButton");
const toolsMenu = document.getElementById("toolsMenu");
let menuOpen = false;

toolsButton.addEventListener("click", (e) => {
  e.stopPropagation();
  if (menuOpen) {
    closeToolsMenu();
  } else {
    openToolsMenu();
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
  positionToolsMenu();
  toolsButton.setAttribute("data-state", "open");
  toolsMenu.setAttribute("data-state", "open");
  toolsMenu.classList.remove("hidden");
  rotateChevron(true);
  menuOpen = true;
}

function closeToolsMenu() {
  toolsButton.setAttribute("data-state", "closed");
  toolsMenu.setAttribute("data-state", "closed");
  setTimeout(() => toolsMenu.classList.add("hidden"), 120);
  rotateChevron(false);
  menuOpen = false;
}

document.addEventListener("click", (e) => {
  if (!menuOpen) return;
  if (!toolsMenu.contains(e.target) && !toolsButton.contains(e.target)) {
    closeToolsMenu();
  }
});

function rotateChevron(open) {
  const svg = toolsButton.querySelector(".lucide-chevron-down");
  if (!svg) return;
  svg.style.transition = "transform 0.15s ease";
  svg.style.transform = open ? "rotate(180deg)" : "rotate(0deg)";
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && menuOpen) closeToolsMenu();
});

// ===============================
// DATA
// ===============================

const M = "America/New_York";
const P = "America/Chicago";

const G = [
  {
    id: "spc-day-1",
    title: "Day 1 Outlooks",
    description: "Convective outlook updates",
    category: "SPC",
    times: [
      {
        id: "0100",
        label: "1:00 AM",
        hour: 1,
        minute: 0,
      },
      {
        id: "0800",
        label: "8:00 AM",
        hour: 8,
        minute: 0,
      },
      {
        id: "1130",
        label: "11:30 AM",
        hour: 11,
        minute: 30,
      },
      {
        id: "1500",
        label: "3:00 PM",
        hour: 15,
        minute: 0,
      },
      {
        id: "2000",
        label: "8:00 PM",
        hour: 20,
        minute: 0,
      },
    ],
  },
  {
    id: "spc-day-2",
    title: "Day 2 Outlooks",
    description: "Extended severe outlook updates",
    category: "SPC",
    times: [
      {
        id: "0100",
        label: "1:00 AM",
        hour: 1,
        minute: 0,
      },
      {
        id: "1230",
        label: "12:30 PM",
        hour: 12,
        minute: 30,
      },
    ],
  },
  {
    id: "spc-day-3",
    title: "Day 3 Outlooks",
    description: "Medium range outlook updates",
    category: "SPC",
    times: [
      {
        id: "0230",
        label: "2:30 AM",
        hour: 2,
        minute: 30,
      },
      {
        id: "1430",
        label: "2:30 PM",
        hour: 14,
        minute: 30,
      },
    ],
  },
  {
    id: "spc-day-4-8",
    title: "Days 4-8 Outlooks",
    description: "Long range outlook updates",
    category: "SPC",
    times: [
      {
        id: "0400",
        label: "4:00 AM",
        hour: 4,
        minute: 0,
      },
    ],
  },
];

const F = [
  {
    id: "gfs",
    title: "GFS",
    description: "Global Forecast System",
    category: "Model",
    times: [
      { id: "00z", label: "00z", hour: 22, minute: 30 },
      { id: "06z", label: "06z", hour: 4, minute: 30 },
      { id: "12z", label: "12z", hour: 10, minute: 30 },
      { id: "18z", label: "18z", hour: 16, minute: 30 },
    ],
  },
  {
    id: "nam",
    title: "NAM",
    description: "North American Mesoscale",
    category: "Model",
    times: [
      { id: "00z", label: "00z", hour: 20, minute: 35 },
      { id: "06z", label: "06z", hour: 2, minute: 35 },
      { id: "12z", label: "12z", hour: 8, minute: 35 },
      { id: "18z", label: "18z", hour: 14, minute: 35 },
    ],
  },
  {
    id: "hrrr",
    title: "HRRR (48hr)",
    description: "High Resolution Rapid Refresh",
    category: "Model",
    times: [
      { id: "00z", label: "00z", hour: 19, minute: 52 },
      { id: "06z", label: "06z", hour: 1, minute: 52 },
      { id: "12z", label: "12z", hour: 7, minute: 52 },
      { id: "18z", label: "18z", hour: 13, minute: 52 },
    ],
  },
  {
    id: "ecmwf",
    title: "ECMWF",
    description: "European Centre global model",
    category: "Model",
    times: [
      { id: "00z", label: "00z", hour: 0, minute: 50 },
      { id: "06z", label: "06z", hour: 6, minute: 50 },
      { id: "12z", label: "12z", hour: 12, minute: 50 },
      { id: "18z", label: "18z", hour: 18, minute: 50 },
    ],
  },
  {
    id: "gdps",
    title: "GDPS",
    description: "Global Deterministic Prediction System",
    category: "Model",
    times: [
      { id: "00z", label: "00z", hour: 23, minute: 0 },
      { id: "12z", label: "12z", hour: 11, minute: 0 },
    ],
  },
  {
    id: "icon",
    title: "ICON",
    description: "Icosahedral Nonhydrostatic model",
    category: "Model",
    times: [
      { id: "00z", label: "00z", hour: 21, minute: 45 },
      { id: "06z", label: "06z", hour: 3, minute: 45 },
      { id: "12z", label: "12z", hour: 9, minute: 45 },
      { id: "18z", label: "18z", hour: 15, minute: 45 },
    ],
  },
];

// Flatten events
const events = [...G, ...F].flatMap((group) =>
  group.times.map((time) => ({
    ...time,
    groupId: group.id,
    groupTitle: group.title,
    category: group.category,
    nextTime: null,
    msUntil: 0,
    ttsSpoken: false,
    chimePlayed: false,
  })),
);

// ===============================
// TIME HELPERS
// ===============================

function getNextLocalTime(hour, minute, timeZone, referenceDate = new Date()) {
  // Create a date string in the target timezone for today
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const parts = formatter.formatToParts(referenceDate);
  const year = parts.find((p) => p.type === "year").value;
  const month = parts.find((p) => p.type === "month").value;
  const day = parts.find((p) => p.type === "day").value;

  // Create ISO string in target timezone
  const timeString = `${year}-${month}-${day}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`;

  // Parse as if it's in the target timezone
  const targetDate = new Date(timeString + "Z"); // Start with UTC
  const utcDate = new Date(
    targetDate.toLocaleString("en-US", { timeZone: "UTC" }),
  );
  const tzDate = new Date(targetDate.toLocaleString("en-US", { timeZone }));
  const offset = utcDate - tzDate;

  let next = new Date(targetDate.getTime() + offset);

  // If the time has passed today, move to tomorrow
  if (next <= referenceDate) {
    next = new Date(next.getTime() + 86400000);
  }

  return next;
}

function formatCountdown(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return days > 0
    ? `${days}d ${String(hours).padStart(2, "0")}h ${String(minutes).padStart(2, "0")}m`
    : `${String(hours).padStart(2, "0")}h ${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}s`;
}

function formatTime(date, timeZone) {
  return date.toLocaleTimeString("en-US", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function playChime() {
  // Ensure we are in a browser
  if (typeof window === "undefined") return;

  // Get AudioContext
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return;

  // Reuse a single AudioContext
  if (!playChime.audioCtx) {
    playChime.audioCtx = new AudioCtx();
  }
  const ctx = playChime.audioCtx;

  // Resume context if suspended
  if (ctx.state === "suspended") {
    ctx.resume();
  }

  const now = ctx.currentTime;

  // Create a gain node for volume control
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, now); // start almost silent
  gain.gain.exponentialRampToValueAtTime(0.25, now + 0.02); // ramp up quickly
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.7); // ramp down slowly
  gain.connect(ctx.destination);

  // First oscillator: high tone
  const osc1 = ctx.createOscillator();
  osc1.type = "sine";
  osc1.frequency.setValueAtTime(660, now);
  osc1.connect(gain);
  osc1.start(now);
  osc1.stop(now + 0.2);

  // Second oscillator: lower tone, delayed
  const osc2 = ctx.createOscillator();
  osc2.type = "sine";
  osc2.frequency.setValueAtTime(440, now + 0.25);
  osc2.connect(gain);
  osc2.start(now + 0.25);
  osc2.stop(now + 0.55);
}

function speak(text) {
  if (!window.speechSynthesis) return;
  const utterance = new SpeechSynthesisUtterance(text);
  window.speechSynthesis.speak(utterance);
}

// ===============================
// DOM ELEMENTS
// ===============================

// Individual toggles
const toggleAllButton = document.getElementById("toggle-all-alerts");
const allToggles = document.querySelectorAll(
  "[id$='-tts-10m'], [id$='-chime-10s']",
);

// Cards
const cards = [
  {
    groupId: "spc-day-1",
    nextLabel: document.getElementById("spc-day-1-next-label"),
    nextTimes: document.getElementById("spc-day-1-next-times"),
    countdown: document.getElementById("spc-day-1-countdown"),
    timesContainer: document.getElementById("spc-day-1-times"),
  },
  {
    groupId: "spc-day-2",
    nextLabel: document.getElementById("spc-day-2-next-run"),
    nextTimes: document.getElementById("spc-day-2-next-times"),
    countdown: document.getElementById("spc-day-2-countdown"),
    timesContainer: document.getElementById("spc-day-2-times"),
  },
  {
    groupId: "spc-day-3",
    nextLabel: document.getElementById("spc-day-3-next-run"),
    nextTimes: document.getElementById("spc-day-3-next-times"),
    countdown: document.getElementById("spc-day-3-countdown"),
    timesContainer: document.getElementById("spc-day-3-times"),
  },
  {
    groupId: "spc-day-4-8",
    nextLabel: document.getElementById("spc-day-4-8-next-run"),
    nextTimes: document.getElementById("spc-day-4-8-next-times"),
    countdown: document.getElementById("spc-day-4-8-countdown"),
    timesContainer: document.getElementById("spc-day-4-8-times"),
  },
  {
    groupId: "gfs",
    nextLabel: document.getElementById("gfs-next-run"),
    nextTimes: document.getElementById("gfs-next-times"),
    countdown: document.getElementById("gfs-countdown"),
    timesContainer: document.getElementById("gfs-times"),
  },
  {
    groupId: "nam",
    nextLabel: document.getElementById("nam-next-run"),
    nextTimes: document.getElementById("nam-next-times"),
    countdown: document.getElementById("nam-countdown"),
    timesContainer: document.getElementById("nam-times"),
  },
  {
    groupId: "hrrr",
    nextLabel: document.getElementById("hrrr-next-run"),
    nextTimes: document.getElementById("hrrr-next-times"),
    countdown: document.getElementById("hrrr-countdown"),
    timesContainer: document.getElementById("hrrr-times"),
  },
  {
    groupId: "ecmwf",
    nextLabel: document.getElementById("ecmwf-next-run"),
    nextTimes: document.getElementById("ecmwf-next-times"),
    countdown: document.getElementById("ecmwf-countdown"),
    timesContainer: document.getElementById("ecmwf-times"),
  },
  {
    groupId: "gdps",
    nextLabel: document.getElementById("gdps-next-run"),
    nextTimes: document.getElementById("gdps-next-times"),
    countdown: document.getElementById("gdps-countdown"),
    timesContainer: document.getElementById("gdps-times"),
  },
  {
    groupId: "icon",
    nextLabel: document.getElementById("icon-next-run"),
    nextTimes: document.getElementById("icon-next-times"),
    countdown: document.getElementById("icon-countdown"),
    timesContainer: document.getElementById("icon-times"),
  },
];

// ===============================
// TOGGLE SWITCH LOGIC
// ===============================

function toggleSwitch(button, checked) {
  if (!button) return;
  const dot = button.querySelector("span");
  button.setAttribute("data-state", checked ? "checked" : "unchecked");
  button.setAttribute("aria-checked", checked ? "true" : "false");
  if (dot) dot.setAttribute("data-state", checked ? "checked" : "unchecked");
}

// Individual toggles
allToggles.forEach((btn) => {
  btn.addEventListener("click", () => {
    const checked = btn.getAttribute("data-state") !== "checked";
    toggleSwitch(btn, checked);
    setTimeout(syncToggleAll, 10);
  });
});

// Toggle all
function syncToggleAll() {
  const allChecked = Array.from(allToggles).every(
    (t) => t.getAttribute("data-state") === "checked",
  );
  toggleSwitch(toggleAllButton, allChecked);
}

if (toggleAllButton) {
  toggleAllButton.addEventListener("click", () => {
    const anyOff = Array.from(allToggles).some(
      (btn) => btn.getAttribute("data-state") !== "checked",
    );
    allToggles.forEach((btn) => toggleSwitch(btn, anyOff));
    toggleSwitch(toggleAllButton, anyOff);
  });
}

// ===============================
// UPDATE LOOP
// ===============================

function updateAllTimers() {
  const now = new Date();
  let nextEvent = null;

  // Update next times for all events
  events.forEach((ev) => {
    ev.nextTime = getNextLocalTime(ev.hour, ev.minute, M, now);
    ev.msUntil = ev.nextTime - now;
    if (!nextEvent || ev.nextTime.getTime() < nextEvent.nextTime.getTime())
      nextEvent = ev;
  });

  if (!nextEvent) return;

  // Update next event card
  const nextEventCard = {
    label: document.getElementById("next-event-label"),
    title: document.getElementById("next-event-title"),
    desc: document.getElementById("next-event-description"),
    countdown: document.getElementById("next-event-countdown"),
    category: document.getElementById("next-event-category"),
    timeET: document.getElementById("next-event-time-et"),
    timeCT: document.getElementById("next-event-time-ct"),
    refresh: document.getElementById("next-event-refresh"),
  };

  if (nextEventCard.label) nextEventCard.label.textContent = "Next Next";
  if (nextEventCard.title)
    nextEventCard.title.textContent =
      nextEvent.category === "SPC"
        ? `${nextEvent.groupTitle}`
        : `${nextEvent.groupTitle} ${nextEvent.label} Run`;
  if (nextEventCard.desc)
    nextEventCard.desc.textContent =
      nextEvent.category === "SPC"
        ? `SPC outlook update at ${formatTime(nextEvent.nextTime, M)} ET / ${formatTime(nextEvent.nextTime, P)} CT`
        : `Model update at ${formatTime(nextEvent.nextTime, M)} ET / ${formatTime(nextEvent.nextTime, P)} CT`;
  if (nextEventCard.countdown)
    nextEventCard.countdown.textContent = formatCountdown(nextEvent.msUntil);
  if (nextEventCard.category)
    nextEventCard.category.textContent =
      nextEvent.category === "SPC" ? "SPC Outlook" : "Model Run";
  nextEvent.category === "SPC"
    ? nextEventCard.category.setAttribute(
        "class",
        "text-[10px] font-mono uppercase tracking-widest px-2 py-1 rounded-md border border-amber-400/40 text-amber-400 bg-amber-400/10",
      )
    : nextEventCard.category.setAttribute(
        "class",
        "text-[10px] font-mono uppercase tracking-widest px-2 py-1 rounded-md border border-cyan-400/40 text-cyan-400 bg-cyan-400/10",
      );
  if (nextEventCard.timeET)
    nextEventCard.timeET.textContent = `ET: ${nextEvent.nextTime.toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit", hour12: true, timeZone: M })} ET`;
  if (nextEventCard.timeCT)
    nextEventCard.timeCT.textContent = `CT: ${nextEvent.nextTime.toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit", hour12: true, timeZone: P })} CT`;
  if (nextEventCard.refresh)
    nextEventCard.refresh.textContent = "Auto-refreshing every second";

  // Update all individual cards
  cards.forEach((card) => {
    if (!card.nextLabel || !card.countdown || !card.timesContainer) return;

    // Get all events for this card
    const futureEvents = events
      .filter((ev) => ev.groupId === card.groupId && ev.nextTime > now)
      .sort((a, b) => a.nextTime - b.nextTime);

    const nextCardEvent = futureEvents[0];
    if (!nextCardEvent) {
      // No upcoming events - hide all badges
      card.timesContainer
        .querySelectorAll("[id$='-badge']")
        .forEach((el) => el.classList.add("hidden"));
      return;
    }

    // Update top section
    card.nextLabel.textContent =
      nextCardEvent.category === "SPC"
        ? `${nextCardEvent.label} update`
        : `${nextCardEvent.label} run`;
    card.nextTimes.textContent = `ET: ${formatTime(nextCardEvent.nextTime, M)} | CT: ${formatTime(nextCardEvent.nextTime, P)}`;
    card.countdown.textContent = formatCountdown(nextCardEvent.msUntil);

    // Hide all badges first
    const allBadges = card.timesContainer.querySelectorAll("[id$='-badge']");
    allBadges.forEach((el) => {
      el.classList.add("hidden");
      el.style.display = "none"; // Ensure they're hidden
    });

    // Show badge for the next update only
    const nextBadge = document.getElementById(
      `${card.groupId}-time-${nextCardEvent.id}-badge`,
    );
    if (nextBadge) {
      nextBadge.classList.remove("hidden");
      nextBadge.style.display = ""; // Reset display
      nextBadge.textContent = "Next";
    }

    // Update timesContainer styling based on which time is next
    const nextContainerId = `${card.groupId}-time-${nextCardEvent.id}`;
    const allTimeContainers = card.timesContainer.querySelectorAll(
      "[id^='" + card.groupId + "-time-']",
    );

    allTimeContainers.forEach((container) => {
      if (container.id.endsWith("-badge")) return; // Skip badges

      const isNext = container.id === nextContainerId;

      // Set class based on whether it's the next event
      if (isNext) {
        container.setAttribute(
          "class",
          "rounded-lg border px-3 py-2 transition border-monitor-active/50 bg-monitor-active/10",
        );
      } else {
        container.setAttribute(
          "class",
          "rounded-lg border border-monitor-border/40 bg-monitor-bg/40 px-3 py-2 transition hover:border-monitor-active/40",
        );
      }
    });

    // Get all badges for this card
    const allNextBadges = document.querySelectorAll(
      `[id^='${card.groupId}-next-badge']`,
    );

    allNextBadges.forEach((badge) => {
      const isCardNext =
        nextEvent &&
        nextEvent.groupId === card.groupId &&
        nextEvent.nextTime > now;
      if (isCardNext) {
        badge.classList.remove("hidden");
        badge.style.display = "";
      } else {
        badge.classList.add("hidden");
        badge.style.display = "none";
      }
    });

    // Alerts
    const cardTtsButton = document.getElementById(`${card.groupId}-tts-10m`);
    const cardChimeButton = document.getElementById(
      `${card.groupId}-chime-10s`,
    );

    if (
      cardTtsButton?.getAttribute("data-state") === "checked" &&
      nextCardEvent.msUntil <= 600_000 &&
      nextCardEvent.msUntil > 599_000 &&
      !nextCardEvent.ttsSpoken
    ) {
      speak(
        `10 minutes until ${nextCardEvent.groupTitle} ${nextCardEvent.category === "SPC" ? "update" : "run"}.`,
      );
      nextCardEvent.ttsSpoken = true;
    }

    if (
      cardChimeButton?.getAttribute("data-state") === "checked" &&
      nextCardEvent.msUntil <= 10_000 &&
      nextCardEvent.msUntil > 9_000 &&
      !nextCardEvent.chimePlayed
    ) {
      playChime();
      nextCardEvent.chimePlayed = true;
    }
  });

  requestAnimationFrame(updateAllTimers);
}

updateAllTimers();
