let WISData;
let lastIntensity = 0;
let low = 0;
let high = 0;
let STREAM_THRESHOLDS = {
  STANDBY: 0,
  ACTIVE: 0,
  EMERGENCY: 0,
};

let lastChannelInfo = {
  name: null,
  subscribers: null,
  icon: null,
};

let displayThreshold = true;

// This will hold the **fetched data** without touching the API repeatedly
let channelDataCache = null;

let forecastText;
const maxChars = 200;

const forecastAnalysis = document.getElementById("forecastAnalysis");
const toggleForecastLength = document.getElementById("toggle-forecast-length");
const toggle = document.getElementById("threshold-toggle");
const dot = document.getElementById("threshold-toggle-circle");

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

toggle.addEventListener("click", () => {
  const isChecked = toggle.getAttribute("data-state") === "checked";
  const infoKey = document.getElementById("infoKey");

  // Toggle state
  toggle.setAttribute("data-state", isChecked ? "unchecked" : "checked");
  toggle.setAttribute("aria-checked", isChecked ? "false" : "true");

  dot.setAttribute("data-state", isChecked ? "unchecked" : "checked");

  // Example: do something when toggled
  if (isChecked) {
    console.log("Threshold hidden");
    displayThreshold = false;
    const thresholdMarker = document.getElementById("threshold-marker");
    if (thresholdMarker) thresholdMarker.remove();
    // hide your threshold bar
  } else {
    console.log("Threshold shown");
    const thresholdEl = document.createElement("div");
    thresholdEl.className = "flex items-center gap-2";
    thresholdEl.id = "threshold-marker";

    thresholdEl.innerHTML = `
      <div class="w-4 h-1 bg-red-500 rounded" style="background-image: repeating-linear-gradient(90deg, rgb(239, 68, 68) 0px, rgb(239, 68, 68) 5px, transparent 5px, transparent 10px);"></div>
      <span class="text-muted-foreground">Threshold</span>
    `;

    infoKey.appendChild(thresholdEl);
    displayThreshold = true;
    // show your threshold bar
  }
});
let expanded = false;

function updateText() {
  if (expanded) {
    forecastAnalysis.textContent = forecastText;
    toggleForecastLength.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m6 15 6-6 6 6" />
        </svg>
        Collapse Data`;
  } else {
    forecastAnalysis.textContent =
      forecastText.length > maxChars
        ? forecastText.slice(0, maxChars) + "..."
        : forecastText;
    toggleForecastLength.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m6 9 6 6 6-6" />
        </svg>
        Expand Analysis`;
  }
}

toggleForecastLength.addEventListener("click", () => {
  expanded = !expanded;
  updateText();
});

let headlines = [];
let activeHeadline = 0;
const DOT_ACTIVE =
  "dot h-1.5 rounded-full transition-all w-6 bg-monitor-active shadow-[0_0_8px_rgba(56,189,248,0.5)]";
const DOT_INACTIVE =
  "dot h-1.5 rounded-full transition-all w-1.5 bg-gray-700 hover:bg-gray-600";

// 1. Fetch from your summaries.json
async function fetchHeadlinesFromSummaries() {
  try {
    const res = await fetch(
      `https://public.yallsoft.app/rhy/summaries.json?t=${new Date().getTime()}`,
    );
    const data = await res.json();

    if (Array.isArray(data.community_analysis.headlines.headlines))
      return data.community_analysis.headlines.headlines;
    return ["No weather headlines available"];
  } catch (err) {
    console.error("Failed to fetch headlines:", err);
    return ["Unable to fetch weather headlines"];
  }
}

// 2. Init everything
async function initHeadlines() {
  headlines = await fetchHeadlinesFromSummaries();
  if (!headlines.length) headlines = ["No active weather headlines"];

  updateHeadline(0);
  createDots(headlines.length);
  setActiveDot(0);
  setupArrows();
}

function setupArrows() {
  const prev = document.getElementById("headlinePrev");
  const next = document.getElementById("headlineNext");

  if (!prev || !next) {
    console.warn("arrow buttons not found?");
    return;
  }

  prev.addEventListener("click", () => {
    const target = (activeHeadline - 1 + headlines.length) % headlines.length;
    goToHeadline(target);
  });

  next.addEventListener("click", () => {
    const target = (activeHeadline + 1) % headlines.length;
    goToHeadline(target);
  });
}

function goToHeadline(i) {
  updateHeadline(i);
  setActiveDot(i);
}

// 3. Update text
function updateHeadline(index) {
  activeHeadline = index;
  const el = document.getElementById("headlineText");
  if (el) el.textContent = headlines[index];
}

// 4. Create dots ONCE
function createDots(count) {
  const container = document.getElementById("headlineDots");
  container.innerHTML = ""; // just once at startup

  for (let i = 0; i < count; i++) {
    const btn = document.createElement("button");
    btn.className = DOT_INACTIVE;
    btn.dataset.index = i;
    btn.setAttribute("aria-label", `Go to headline ${i + 1}`);

    btn.addEventListener("click", () => {
      updateHeadline(i);
      setActiveDot(i);
    });

    container.appendChild(btn);
  }
}

// 5. Toggle active dot WITHOUT recreating them
function setActiveDot(index) {
  const container = document.getElementById("headlineDots");
  const buttons = container.querySelectorAll("button");

  buttons.forEach((btn, i) => {
    btn.className = i === index ? DOT_ACTIVE : DOT_INACTIVE;
  });
}

const lerp = (a, b, t) => a + (b - a) * t;
const smoothstep = (t) => t * t * (3 - 2 * t);

const WIS_BANDS = [
  { min: 0, max: 30, start: "rgb(16, 185, 129)", end: "rgb(250, 204, 21)" },
  { min: 30, max: 50, start: "rgb(250, 204, 21)", end: "rgb(251, 146, 60)" },
  { min: 50, max: 70, start: "rgb(251, 146, 60)", end: "rgb(239, 68, 68)" },
  { min: 70, max: 100, start: "rgb(239, 68, 68)", end: "rgb(220, 38, 38)" },
  { min: 100, max: 150, start: "rgb(220, 38, 38)", end: "rgb(168, 85, 247)" },
  { min: 150, max: 250, start: "rgb(168, 85, 247)", end: "rgb(232, 121, 249)" },
  {
    min: 250,
    max: 350,
    start: "rgb(232, 121, 249)",
    end: "rgb(251, 113, 133)",
  },
  {
    min: 350,
    max: 500,
    start: "rgb(251, 113, 133)",
    end: "rgb(255, 255, 255)",
  },
];

const withAlpha = (rgb, a = 1) =>
  rgb.startsWith("rgba")
    ? rgb.replace(/rgba\(([^)]+),[^)]+\)/, `rgba($1,${a})`)
    : rgb.replace("rgb(", "rgba(").replace(")", `,${a})`);

function getWISColor(value, alpha = 1) {
  for (const band of WIS_BANDS) {
    if (value >= band.min && value < band.max) {
      const t = (value - band.min) / (band.max - band.min);
      return colorLerp(
        withAlpha(band.start, alpha),
        withAlpha(band.end, alpha),
        t,
      );
    }
  }

  if (value < WIS_BANDS[0].min) {
    return withAlpha(WIS_BANDS[0].start, alpha);
  }

  return withAlpha(WIS_BANDS.at(-1).end, alpha);
}

let lastStreamStatus = null;

function updateThresholdBadges(score, threshold, standbyThreshold) {
  const isAbove = score >= threshold;
  const isAboveStandby = score >= standbyThreshold;
  const statusBadge = document.getElementById("statusBadge");

  if (!statusBadge) return;

  const currentStatus = isAbove
    ? "live"
    : isAboveStandby
      ? "standby"
      : "offline";

  // 🚫 No change → no DOM updates
  if (currentStatus === lastStreamStatus) return;

  lastStreamStatus = currentStatus;

  if (currentStatus === "live") {
    statusBadge.setAttribute(
      "class",
      "inline-flex items-center rounded-full border transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 gap-2 px-3 py-1.5 text-xs font-bold font-mono tracking-wide animate-pulse bg-monitor-danger text-black hover:bg-monitor-danger",
    );
    statusBadge.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-radio w-4 h-4"><path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"></path><path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5"></path><circle cx="12" cy="12" r="2"></circle><path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5"></path><path d="M19.1 4.9C23 8.8 23 15.1 19.1 19"></path></svg>LIVE NOW`;
  } else if (currentStatus === "standby") {
    statusBadge.setAttribute(
      "class",
      "inline-flex items-center rounded-full border transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 gap-2 px-3 py-1.5 text-xs font-bold font-mono tracking-wide animate-pulse bg-monitor-warning text-black hover:bg-monitor-warning",
    );
    statusBadge.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-info w-4 h-4 flex-shrink-0"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>STANDING BY`;
  } else {
    statusBadge.setAttribute(
      "class",
      "inline-flex items-center rounded-full border transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 gap-2 px-3 py-1.5 text-xs font-bold font-mono tracking-wide bg-monitor-card border-monitor-border text-gray-500",
    );
    statusBadge.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-radio w-4 h-4"><path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"></path><path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5"></path><circle cx="12" cy="12" r="2"></circle><path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5"></path><path d="M19.1 4.9C23 8.8 23 15.1 19.1 19"></path></svg>NOT STREAMING`;
  }
}

// Call this every frame or on data update
function drawWISChart(
  scalerWidth,
  scalerHeight,
  canvas,
  data,
  showThreshold = true,
) {
  const ctx = canvas.getContext("2d");
  const dpi =
    window.devicePixelRatio % 1 === 0
      ? 1
      : window.devicePixelRatio - (window.devicePixelRatio % 1);

  // === Setup Canvas Scaling ===
  const rect = scalerWidth.getBoundingClientRect();
  const x = rect.x;
  const width = scalerWidth.clientWidth;
  const height = scalerHeight.clientHeight;
  canvas.width = Math.max(width, width * dpi);
  canvas.height = Math.min(height, 200);
  canvas.style = `display: block; width: ${width}px; height: 200px;`;
  ctx.setTransform(dpi, 0, 0, dpi, 0, 0);
  ctx.clearRect(0, 0, width, height);

  // === Validate Data ===
  if (!data || !data.wis || !Array.isArray(data.score_history)) return;

  updateThresholdBadges(
    data.wis.weather_intensity_score,
    STREAM_THRESHOLDS?.ACTIVE,
    STREAM_THRESHOLDS?.STANDBY,
  );

  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

  // === Prepare History ===
  const history = data.score_history.filter(
    (p) => p && p.timestamp && new Date(p.timestamp) >= oneHourAgo,
  );

  const forecastPoints = [];
  let runningScore = data.wis.weather_intensity_score;

  // === Build Forecast ===
  if (data.wis.forecast_changes) {
    for (let i = 1; i <= 30; i++) {
      const key = `minute_${i}`;
      if (data.wis.forecast_changes[key] !== undefined) {
        runningScore += data.wis.forecast_changes[key];
        forecastPoints.push({
          time: new Date(now.getTime() + i * 60 * 1000),
          score: runningScore,
        });
      }
    }
  }

  // === Get Ranges ===
  const allScores = [
    ...history.map((p) => p.weather_intensity_score),
    data.wis.weather_intensity_score,
    ...forecastPoints.map((p) => p.score),
  ];

  if (
    showThreshold &&
    data.wis.todays_stream_info?.weather_intensity_score_threshold
  ) {
    allScores.push(
      data.wis.todays_stream_info.weather_intensity_score_threshold,
    );
    allScores.push(STREAM_THRESHOLDS?.ACTIVE);
  }

  let minY = Math.min(...allScores);
  let maxY = Math.max(...allScores);
  if (!Number.isFinite(minY) || !Number.isFinite(maxY)) return;

  if (minY === maxY) {
    const pad = minY === 0 ? 5 : Math.max(Math.abs(minY) * 0.1, 5);
    minY -= pad;
    maxY += pad;
  } else {
    const pad = (maxY - minY) * 0.1;
    minY -= pad;
    maxY += pad;
  }

  // === Chart Area ===
  const margin = { top: 20, right: 20, bottom: 120, left: 50 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;
  const rangeY = Math.max(maxY - minY, 1);

  // === Time Axis Range ===
  const startTime = history[0] ? new Date(history[0].timestamp) : now;
  const endTime = forecastPoints.length
    ? forecastPoints[forecastPoints.length - 1].time
    : now;
  let minX = Math.min(startTime.getTime(), now.getTime());
  let maxX = Math.max(endTime.getTime(), now.getTime());
  if (minX === maxX) {
    minX -= 60000;
    maxX += 60000;
  }
  const padX = (maxX - minX) * 0.05,
    time = Math.max(minX - padX, startTime.getTime()),
    paddedEndTime = maxX + padX,
    timeRange = Math.max(paddedEndTime - time, 1);

  // === Coordinate Mappers ===
  const yToPixel = (v) => {
    const pixel = Math.min(Math.max(v, minY), maxY);
    return height - margin.bottom - ((pixel - minY) / rangeY) * chartHeight;
  };
  const timeToPixel = (t) => {
    const time = t.getTime(),
      pixel = Math.min(Math.max(time, minX), maxX);
    return margin.left + ((pixel - minX) / timeRange) * chartWidth;
  };
  // === Draw Grid ===
  ctx.strokeStyle = "rgba(255,255,255,0.1)";
  ctx.lineWidth = 1;
  ctx.setLineDash([2, 2]);
  for (let i = 0; i <= 5; i++) {
    const y = margin.top + (i * chartHeight) / 5;
    ctx.beginPath();
    ctx.moveTo(margin.left, y);
    ctx.lineTo(width - margin.right, y);
    ctx.stroke();

    const label = maxY - (i * (maxY - minY)) / 5;
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.font = '11px "JetBrains Mono", monospace';
    ctx.textAlign = "right";
    ctx.fillText(label.toFixed(1), margin.left - 5, y + 4);
  }

  // === Threshold Line ===
  if (
    showThreshold &&
    data.wis.todays_stream_info?.weather_intensity_score_threshold &&
    STREAM_THRESHOLDS?.ACTIVE
  ) {
    const th = data.wis.todays_stream_info.weather_intensity_score_threshold;
    const eth = STREAM_THRESHOLDS.ACTIVE;
    if (th > minY && th < maxY) {
      const y = yToPixel(th);
      ctx.strokeStyle = "#ef4444";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(margin.left, y);
      ctx.lineTo(width - margin.right, y);
      ctx.stroke();
      ctx.fillStyle = "#ef4444";
      ctx.font = 'bold 11px "JetBrains Mono", monospace';
      ctx.textAlign = "left";
      ctx.fillText(
        `Ryan Hall, Y'all's Threshold: ${th.toFixed(1)}`,
        width - margin.right - 220,
        y - 5,
      );
      ctx.setLineDash([]);
    }

    if (eth > minY && eth < maxY) {
      const y = yToPixel(eth);
      ctx.strokeStyle = "#ef4444";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(margin.left, y);
      ctx.lineTo(width - margin.right, y);
      ctx.stroke();
      ctx.fillStyle = "#ef4444";
      ctx.font = 'bold 11px "JetBrains Mono", monospace';
      ctx.textAlign = "left";
      ctx.fillText(
        `eYuM's threshold: ${eth.toFixed(1)}`,
        width - margin.right - 145,
        y - 5,
      );
      ctx.setLineDash([]);
    }
  }

  // === Draw Historical Line (Green) ===
  // === CONNECTED GRADIENT WIS HISTORY LINE ===
  const historyPoints = history.map((p, i) => {
    const time = new Date(p.timestamp);

    return {
      x: timeToPixel(time),
      y: yToPixel(p.weather_intensity_score),
      score: p.weather_intensity_score,
      time,
    };
  });

  if (historyPoints.length > 0) {
    ctx.lineWidth = 3;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.lineJoin("round");
    
    for (let i = 0; i < historyPoints.length; i++) {
      const p1 = historyPoints[i];
      const p2 = historyPoints[i + 1] || {
        x: timeToPixel(now),
        y: yToPixel(data.wis.weather_intensity_score),
      };

      const x1 = p1.x;
      const y1 = p1.y;

      const x2 = p2.x;
      const y2 = p2.y;

      const c1 = getWISColor(p1.score);
      const c2 = getWISColor(p2.score);

      const grad = ctx.createLinearGradient(x1, y1, x2, y2);
      grad.addColorStop(0, c1);
      grad.addColorStop(1, c2);

      ctx.strokeStyle = grad;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
  }

  // === Draw Current Point ===
  const nowX = timeToPixel(now);
  const nowY = yToPixel(data.wis.weather_intensity_score);
  ctx.strokeStyle = "rgba(255,255,255,0.3)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(nowX, margin.top);
  ctx.lineTo(nowX, height - margin.bottom);
  ctx.stroke();

  ctx.fillStyle = "rgba(255,255,255,0.8)";
  ctx.font = 'bold 12px "JetBrains Mono", monospace';
  ctx.textAlign = "center";
  ctx.fillText("NOW", nowX, height - margin.bottom + 20);

  // === Pulsing “Now” Circle ===
  const t = Math.floor(Date.now()) / 1000;
  const pulse = Math.sin(t * 4) * 0.5 + 0.5;
  const radius = 5 + pulse * 3;
  ctx.fillStyle = getWISColor(data.wis.weather_intensity_score, 0.3 * pulse);
  ctx.beginPath();
  ctx.arc(nowX, nowY, radius + 5, 0, 2 * Math.PI);
  ctx.fill();

  ctx.fillStyle = getWISColor(data.wis.weather_intensity_score);
  ctx.strokeStyle = "rgba(255,255,255,0.8)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(nowX, nowY, radius, 0, 2 * Math.PI);
  ctx.fill();
  ctx.stroke();

  // === Draw Forecast Line (Blue Dashed) ===
  if (forecastPoints.length > 0) {
    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 3;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(nowX, nowY);
    forecastPoints.forEach((p) => {
      ctx.lineTo(timeToPixel(p.time), yToPixel(p.score));
    });
    ctx.stroke();
    ctx.setLineDash([]);
  }

  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.font = "11px system-ui";
  ctx.textAlign = "center";

  // === Time Labels (-60m / +30m) ===
  const first = history[0] ? new Date(history[0].timestamp) : null;
  if (first) {
    const diff = Math.round((now.getTime() - first.getTime()) / 60000);
    if (diff > 0) {
      ctx.fillText(
        `-${diff}m`,
        timeToPixel(first),
        height - margin.bottom + 20,
      );
    }
  }

  const last = forecastPoints.length
    ? forecastPoints[forecastPoints.length - 1].time
    : null;
  if (last) {
    const diff = Math.round((last.getTime() - now.getTime()) / 60000);
    if (diff > 0)
      ctx.fillText(`+${diff}m`, timeToPixel(last), height - margin.bottom + 20);
  }
}

function updateWISChartSize() {
  drawWISChart(
    document.getElementById("infoKey"),
    document.getElementById("graphScaler"),
    document.getElementById("wisGraph"),
    WISData,
    displayThreshold,
  );
  requestAnimationFrame(updateWISChartSize);
}

const WARNING_COLORS = {
  "TORNADO EMERGENCY": { main: "#950BA1", dark: "#72067A" },

  "TO.W": { main: "#FF0000", dark: "#cc0000" },
  "TO.A": { main: "#ff3333", dark: "#ff0000" },

  "SV.W": { main: "#FFA500", dark: "#FF8C00" },
  "SV.A": { main: "#FFB733", dark: "#FFA500" },

  "FF.W": { main: "#39B54A", dark: "#2d8f3b" },
  "FF.A": { main: "#A7E2FF", dark: "#87CEEB" },

  "WS.W": { main: "#FF69B4", dark: "#cc5490" },
  "WS.A": { main: "#4169E1", dark: "#0000CD" },

  "WW.Y": { main: "#87CEEB", dark: "#4682B4" },

  "BZ.W": { main: "#E67300", dark: "#CC6600" },
  "IS.W": { main: "#8B008B", dark: "#6b006b" },
  "MA.W": { main: "#731e56", dark: "#5a1743" },

  "FZ.W": { main: "#483D8B", dark: "#27508F" },
  "FZ.A": { main: "#ADD8E6", dark: "#87CEEB" },

  "SP.S": { main: "#9370DB", dark: "#7B68EE" },
  "SQ.W": { main: "#00BFFF", dark: "#0099cc" },
  "LE.W": { main: "#008B8B", dark: "#006b6b" },

  "EC.W": { main: "#1B4F72", dark: "#0A2A3F" },
  "EC.A": { main: "#2874A6", dark: "#1B4F72" },

  "CW.Y": { main: "#5DADE2", dark: "#2874A6" },
  "WC.Y": { main: "#85C1E9", dark: "#5DADE2" },

  "AV.W": { main: "#1E90FF", dark: "#0066CC" },
  "AV.A": { main: "#6495ED", dark: "#4F75BA" },

  "FL.W": { main: "#006400", dark: "#004d00" },
  "FA.W": { main: "#008B45", dark: "#006633" },

  "CF.W": { main: "#20B2AA", dark: "#178F88" },
  "LS.W": { main: "#3CB371", dark: "#2E8B57" },

  "FL.Y": { main: "#90EE90", dark: "#74c474" },
  "FA.Y": { main: "#98FB98", dark: "#7bc97b" },

  "CF.Y": { main: "#B0E0E6", dark: "#89b3b9" },
  "LS.Y": { main: "#ADD8E6", dark: "#8badb6" },

  "FL.A": { main: "#4F9B82", dark: "#3d7a66" },
  "FA.A": { main: "#5F9EA0", dark: "#4b7e80" },
  "CF.A": { main: "#87CEEB", dark: "#6ca3bc" },
  "LS.A": { main: "#79CDCD", dark: "#61a3a3" },

  "CF.S": { main: "#B8D8D8", dark: "#93acac" },

  "FR.Y": { main: "#6495ED", dark: "#4f75ba" },

  "HU.W": { main: "#8B0000", dark: "#660000" },
  "HU.A": { main: "#FFB6C1", dark: "#FF91A4" },

  "TR.W": { main: "#FFD700", dark: "#CCAC00" },
  "TR.A": { main: "#4682B4", dark: "#36618A" },

  "SS.W": { main: "#8B008B", dark: "#6B006B" },
  "SS.A": { main: "#BA55D3", dark: "#9A42AD" },

  "EW.W": { main: "#FF8C00", dark: "#E57A00" },
  "HW.W": { main: "#DAA520", dark: "#C9961A" },
  "HW.A": { main: "#B8860B", dark: "#A57408" },

  "DS.W": { main: "#FFE4C4", dark: "#E6C9A6" },
  "DS.Y": { main: "#BDB76B", dark: "#A9A45F" },

  "DU.W": { main: "#FFE4C4", dark: "#E6C9A6" },
  "DU.Y": { main: "#BDB76B", dark: "#A9A45F" },

  "HF.W": { main: "#CD5C5C", dark: "#B55252" },
  "HF.A": { main: "#9932CC", dark: "#882AB8" },
};

const ICON_TORNADO = `
  <svg xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none" stroke="currentColor" stroke-width="2"
    stroke-linecap="round" stroke-linejoin="round"
    class="h-6 w-6"
  >
    <path d="M21 4H3" />
    <path d="M18 8H6" />
    <path d="M19 12H9" />
    <path d="M16 16h-6" />
    <path d="M11 20H9" />
  </svg>
`;

const ICON_SEVERE_TSTM = `
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="lucide lucide-zap h-6 w-6"
  >
    <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"></path>
  </svg>
`;

const ICON_FLOOD = `
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="lucide lucide-cloud-rain w-6 h-6"
  >
    <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"></path>
    <path d="M16 14v6"></path>
    <path d="M8 14v6"></path>
    <path d="M12 16v6"></path>
  </svg>
`;

const ICON_WINTER = `
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="lucide lucide-snowflake w-6 h-6"
  >
    <line x1="2" y1="12" x2="22" y2="12" />
    <line x1="12" y1="2" x2="12" y2="22" />
    <path d="m20 16-4-4 4-4" />
    <path d="m4 8 4 4-4 4" />
    <path d="m16 4-4 4-4-4" />
    <path d="m8 20 4-4 4 4" />
  </svg>
`;
const ICON_WIND = `
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="lucide lucide-wind w-6 h-6"
  >
    <path d="M12.8 19.6A2 2 0 1 0 14 16H2"></path>
    <path d="M17.5 8a2.5 2.5 0 1 1 2 4H2"></path>
    <path d="M9.8 4.4A2 2 0 1 1 11 8H2"></path>
  </svg>
`;
const ICON_ALERT = `
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="lucide lucide-circle-alert h-6 w-6"
  >
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" x2="12" y1="8" y2="12"></line>
    <line x1="12" x2="12.01" y1="16" y2="16"></line>
  </svg>
`;
const ICON_CLOCK = `
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="lucide lucide-clock w-6 h-6 text-zinc-400"
  >
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
`;

/**
 * Create headline dots with animation
 * @param {number} count - total number of headlines
 * @param {number} activeIndex - the currently active headline (0-based)
 */
function renderHeadlineDots(count, activeIndex) {
  const container = document.getElementById("headlineDots");

  container.innerHTML = Array.from({ length: count }, (_, i) => {
    const active = i === activeIndex;

    return `
      <button
        class="dot h-1 rounded-full transition-all ${
          active ? "w-4 bg-gray-400" : "w-1 bg-gray-600 hover-bg-gray-500"
        }"
        aria-label="Go to headline ${i + 1}"
        data-index="${i}"
      ></button>
    `;
  }).join("");

  // Add click listeners (if you want interaction)
  container.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", () => {
      const index = Number(btn.dataset.index);
      animateToHeadline(index);
    });
  });
}

/**
 * Example: animate the dot changes
 */
function animateToHeadline(newActive) {
  renderHeadlineDots(10, newActive);
}

renderHeadlineDots(10, 1);

function getIcon(w) {
  const t = w.title.toLowerCase();

  if (t.includes("tornado")) return ICON_TORNADO;
  if (t.includes("thunderstorm") || t.includes("severe"))
    return ICON_SEVERE_TSTM;
  if (t.includes("flood")) return ICON_RAIN;
  if (t.includes("winter") || t.includes("blizzard") || t.includes("snow"))
    return ICON_WINTER;
  if (t.includes("wind")) return ICON_WIND;

  return ICON_ALERT;
}

function getWarningColor(product, significance) {
  const key = `${product}.${significance}`;
  return WARNING_COLORS[key] || null;
}

function formatCoverageArea(data) {
  // Collect unique state codes (if states exist)
  const stateCodes = data.states
    ? data.states
        .map((state) => state.code)
        .filter((code, index, array) => array.indexOf(code) === index)
    : [];

  // Get counties, defaulting to an empty array
  const counties = data.counties || [];

  // If counties are present, prioritize them
  if (counties.length > 0) {
    // Prefix with states if available
    const statePrefix =
      stateCodes.length > 0 ? `${stateCodes.join(", ")}: ` : "";

    // If two or fewer counties, list them all
    if (counties.length <= 2) {
      return `${statePrefix}${counties.join(", ")}`;
    }

    // Otherwise, show the first two and summarize the rest
    return `${statePrefix}${counties.slice(0, 2).join(", ")} +${counties.length - 2} zones`;
  }

  // No counties: fall back to states or the entire U.S.
  if (stateCodes.length > 0) {
    return stateCodes.join(", ");
  }

  return "United States";
}

function getSeverity(w) {
  const t = w.tags || {};

  if (
    w.emergency ||
    w.title.includes("Tornado Emergency") ||
    t.TORNADO_DAMAGE_THREAT === "CATASTROPHIC" ||
    t.FLASH_FLOOD_DAMAGE_THREAT === "CATASTROPHIC" ||
    t.THUNDERSTORM_DAMAGE_THREAT === "DESTRUCTIVE"
  )
    return "extreme";

  if (
    t.PDS ||
    t.EDS ||
    t.TORNADO === "OBSERVED" ||
    t.TORNADO_DAMAGE_THREAT === "CONSIDERABLE" ||
    t.THUNDERSTORM_DAMAGE_THREAT === "CONSIDERABLE"
  )
    return "severe";

  if (
    (w.product === "TO" && w.significance === "W") ||
    (w.product === "SV" && w.significance === "W") ||
    (w.product === "FF" && w.significance === "W")
  )
    return "moderate";

  return "standard";
}

function getExpiresIn(w) {
  const now = Date.now();
  const exp = new Date(w.expires_at).getTime();
  const min = Math.floor((exp - now) / 60000);

  if (min < 0) return "Expired";
  if (min < 60) return `${min}m`;

  return `${Math.floor(min / 60)}h ${min % 60}m`;
}

function hexToRgba(hex, alpha = 1) {
  // Remove leading "#"
  hex = hex?.replace("#", "").trim();

  // #RGB → convert to #RRGGBB
  if (hex?.length === 3) {
    hex = hex
      .split("")
      .map((x) => x + x)
      .join("");
  }

  // #RRGGBBAA → handle alpha inside hex
  if (hex?.length === 8) {
    const a = parseInt(hex.slice(6, 8), 16) / 255;
    alpha = a; // override manual alpha
    hex = hex.slice(0, 6);
  }

  if (hex?.length !== 6) {
    console.warn("Invalid hex color:", hex);
    return `rgba(0,0,0,${alpha})`;
  }

  const int = parseInt(hex, 16);

  const r = (int >> 16) & 255;
  const g = (int >> 8) & 255;
  const b = int & 255;

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function renderWarningCard(warning, index = 1) {
  const severity = getSeverity(warning);
  const icon = getIcon(warning);

  const expires = getExpiresIn(warning);

  return `
  <a
    class="relative container mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-2 md:gap-4"
    href="/warnings"
  >
  <div class="flex items-center gap-2 md:gap-3 min-w-0 w-full md:w-auto justify-center md:justify-start">
    <div class="p-1.5 bg-black/20 rounded-lg backdrop-blur-sm border border-white/10 shadow-sm shrink-0">
      ${icon}
    </div>
    <div class="min-w-0 text-center md:text-left">
      <div class="flex items-center gap-2 justify-center md:justify-start mb-0.5">
        <span class="font-bold text-sm md:text-base font-tech uppercase tracking-wide leading-tight text-shadow-sm truncate max-w-[300px] md:max-w-none">
          ${warning.title}
        </span>
      </div>
      <div class="flex flex-wrap items-center gap-2 text-xs font-medium opacity-90 justify-center md:justify-start">
        <span class="flex items-center gap-1.5 font-mono text-white/90 bg-black/10 px-1.5 py-0.5 rounded text-[10px] md:text-xs">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="lucide lucide-map-pin w-3 h-3"
          >
            <path
              d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"
            ></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          ${formatCoverageArea(warning)}
        </span>
        ${warning?.tags?.HAZARD ? `<span class="font-mono uppercase tracking-tight hidden sm:inline">${warning?.tags?.HAZARD}</span>` : ""}
        ${
          warning?.tags?.SOURCE
            ? `
            <span class="w-1 h-1 rounded-full bg-white/50 hidden sm:block"></span>
            <span class="font-mono uppercase tracking-tight opacity-75 hidden sm:inline">${warning?.tags?.SOURCE}</span>
          `
            : ""
        }
      </div>
    </div>
  </div>
  <div class="flex flex-wrap items-center justify-center md:justify-end gap-2 text-xs font-mono w-full md:w-auto bg-black/10 md:bg-transparent rounded-lg p-1.5 md:p-0">
    <div class="flex items-center gap-1.5 opacity-90">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="lucide lucide-clock w-3.5 h-3.5"
      >
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
      </svg>
      <span data-expires>
        EXP: ${expires}
      </span>
    </div>
  </div>
</a>
`;
}

let currentTopWarningId = null;
let topWarningCache = null;

async function populateTopWarning() {
  const topWarningEl = document.getElementById("topWarning");

  const res = await fetch(
    `https://public.yallsoft.app/rhy/top_10_warnings.json?t=${new Date().getTime()}`,
  );
  const warnings = await res.json();

  if (!warnings.length) return;

  const top = warnings[0]; // first warning
  const colors = getWarningColor(top.product, top.significance);

  topWarningEl.style.cssText = `${
    colors?.main ? `background-color: ${hexToRgba(colors?.main)}` : ""
  }; ${
    colors?.dark
      ? `border-bottom: 1px solid ${hexToRgba(colors?.dark) || "#333"};`
      : ""
  } box-shadow: ${hexToRgba(colors?.main, 0.314)} 0px 4px 20px -5px;`;

  if (top.id !== currentTopWarningId) {
    currentTopWarningId = top.id;

    topWarningEl.innerHTML = renderWarningCard(top);

    const card = topWarningEl.querySelector("a");
    topWarningCache = {
      warning: top,
      expiresEl: card.querySelector("[data-expires]"),
      card,
    };
  } else {
    topWarningCache.warning = top;
    updateTopWarningExpiration();
  }
}

function updateTopWarningExpiration() {
  if (!topWarningCache?.warning || !topWarningCache?.expiresEl) return;

  const expires = getExpiresIn(topWarningCache.warning);
  topWarningCache.expiresEl.textContent = `EXP: ${expires}`;
}

async function fetchChannelInfo(channelId, apiKey) {
  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelId}&key=${apiKey}`,
  );

  const data = await res.json();
  if (!data.items || !data.items.length) return;

  const ch = data.items[0];

  channelDataCache = {
    name: ch.snippet.title,
    subscribers: parseInt(ch.statistics.subscriberCount),
    icon: ch.snippet.thumbnails.default.url,
  };
}

function updateChannelUIFromCache() {
  if (!channelDataCache) return; // nothing fetched yet

  const currentInfo = channelDataCache;

  // Check if anything changed
  const changed =
    currentInfo.name !== lastChannelInfo.name ||
    currentInfo.subscribers !== lastChannelInfo.subscribers ||
    currentInfo.icon !== lastChannelInfo.icon;

  if (!changed) return; // nothing to update

  // Update UI
  document.getElementById("eYuMs-channel-name").textContent = currentInfo.name;
  document.getElementById("eYuMs-subscriber-count").textContent =
    currentInfo.subscribers.toLocaleString() + " subscribers";

  // Cache the new values
  lastChannelInfo = currentInfo;
}

/**
 * Function to update DOS UI
 * @param {*} data
 */
let cachedDOSData = null;

async function updateDosUI(data) {
  // Compare old vs new
  if (cachedDOSData && JSON.stringify(cachedDOSData) === JSON.stringify(data)) {
    return; // nothing changed, skip updating
  }
  cachedDOSData = data;

  const getPlanStyles = (plan) => {
    if (!plan) {
      return {
        bg: "bg-white/5",
        text: "text-gray-300",
        border: "border-white/10",
      };
    }

    switch (plan.toLowerCase()) {
      case "no":
      case "not likely":
        return {
          bg: "bg-red-500/10",
          text: "text-red-400",
          border: "border-red-500/20",
        };
      case "maybe":
        return {
          bg: "bg-orange-500/10",
          text: "text-orange-400",
          border: "border-orange-500/20",
        };
      case "probably":
        return {
          bg: "bg-yellow-500/10",
          text: "text-yellow-400",
          border: "border-yellow-500/20",
        };
      case "yes":
        return {
          bg: "bg-green-500/10",
          text: "text-green-400",
          border: "border-green-500/20",
        };
      case "posted":
        return {
          bg: "bg-cyan-500/10",
          text: "text-cyan-400",
          border: "border-cyan-500/20",
        };
      default:
        return {
          bg: "bg-white/5",
          text: "text-gray-300",
          border: "border-white/10",
        };
    }
  };

  // ⭐ FIXED + COMPLETED DATE PARSER
  const parseDate = (dateStr) => {
    let d = new Date(dateStr);

    if (isNaN(d.getTime())) {
      // yyyy-mm-dd
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        d = new Date(dateStr + "T00:00:00");

        // mm/dd/yyyy or mm-dd-yyyy
      } else if (/^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}$/.test(dateStr)) {
        const parts = dateStr.split(/[\/\-]/);
        const month = parseInt(parts[0]) - 1;
        const day = parseInt(parts[1]);
        const year = parseInt(parts[2]);
        d = new Date(year, month, day);
      }
    }

    if (isNaN(d.getTime())) {
      console.error("Invalid DOS date:", dateStr);
      return { day: "N/A", dateNum: "--" };
    }

    return {
      day: d.toLocaleDateString("en-US", { weekday: "short" }),
      dateNum: d.getDate(),
    };
  };

  // ⭐ Extract percentage like "20%" → "20%"
  const extractPercent = (str) => {
    if (!str) return "0%";
    const match = str.match(/(\d+)%/);
    return match ? match[1] + "%" : "0%";
  };

  let likelyUploads = 0;
  let possibleUploads = 0;

  // ⭐ SELECT ALL DAYS FROM YOUR API
  const days = data.daily_outlook_scores;
  const container = document.getElementById("dosDays");

  if (!container) {
    console.error("DOS container not found!");
    return;
  }

  container.innerHTML = ""; // wipe old content

  Object.values(days).forEach((d) => {
    const plan = d.public.chance_ryan_makes_a_video_this_day.toLowerCase();

    if (["yes", "probably"].includes(plan)) likelyUploads++;
    else if (plan === "maybe") possibleUploads++;
  });

  const likelyEl = document.getElementById("likelyUploadCount");
  const possibleEl = document.getElementById("possibleUploadCount");

  if (likelyEl) {
    likelyEl.innerHTML = `<span class="text-green-400 font-semibold">${likelyUploads}</span> likely uploads`;
  }

  if (possibleEl) {
    possibleEl.innerHTML = `<span class="text-yellow-400 font-semibold">${possibleUploads}</span> possible`;
  }

  function pickIcon(score, comps) {
    let icon = "/icons/weather/animated/clear-day.svg";

    if (score < 30) return icon;

    const maxType = Object.entries(comps || {}).reduce(
      (a, b) => (b[1] > a[1] ? b : a),
      ["", 0],
    )[0];

    switch (maxType) {
      case "spc_score":
        icon =
          score >= 90
            ? "/icons/weather/animated/severe-thunderstorm.svg"
            : score >= 80
              ? "/icons/weather/animated/thunderstorms.svg"
              : score >= 70
                ? "/icons/weather/animated/rainy-3.svg"
                : score >= 60
                  ? "/icons/weather/animated/rainy-2.svg"
                  : "/icons/weather/animated/rainy-1.svg";
        break;
      case "nhc_score":
        icon =
          score >= 90
            ? "/icons/weather/animated/hurricane.svg"
            : "/icons/weather/animated/tropical-storm.svg";
        break;
      case "winter_score":
        icon =
          score >= 90
            ? "/icons/weather/animated/snowy-3.svg"
            : score >= 60
              ? "/icons/weather/animated/snowy-2.svg"
              : "/icons/weather/animated/snowy-1.svg";
        break;

      default:
        icon = "/icons/weather/animated/clear-day.svg";
    }

    return icon;
  }

  // ⭐ LOOP THROUGH ALL 7 DAYS
  Object.values(days).forEach((dayObj) => {
    const styles = getPlanStyles(
      dayObj.public.chance_ryan_makes_a_video_this_day,
    );
    const { day, dateNum } = parseDate(dayObj.public.date);
    const dos = !dayObj.dos_score ? "N/A" : dayObj.dos_score.toFixed(1);
    const liveChance = extractPercent(
      dayObj.public.chance_ryan_goes_live_this_day,
    );

    const icon = pickIcon(dayObj.dos_score, dayObj.component_scores);

    const card = `
      <div class="${styles.bg} ${styles.border} border-2 rounded-xl p-4 transition-all duration-300 hover:scale-105 min-w-[170px] flex-shrink-0">
        
        <div class="text-center mb-3">
          <div class="font-bold text-lg font-tech">${day}</div>
          <div class="text-sm text-monitor-active/80 font-mono">${dateNum}</div>
        </div>

        <div class="flex justify-center mb-4">
          <img src="${icon}" alt="weather icon" class="w-16 h-16 drop-shadow-[0_0_15px_rgba(107,138,253,0.3)]">
        </div>

        <div class="text-center mb-3">
          <div class="text-xs text-gray-400 font-tech uppercase tracking-[0.2em] mb-1">DOS Score</div>
          <div class="text-amber-400 text-2xl font-bold font-tech bg-amber-500/10 py-1 px-3 rounded-lg border border-amber-500/20 inline-block shadow-[0_0_10px_rgba(251,191,36,0.1)]">${dos}</div>
        </div>

        <div class="text-center mb-4">
          <div class="text-xs text-gray-400 font-tech uppercase tracking-[0.2em] mb-1">LIVE Stream Chance</div>
          <div class="text-monitor-active text-2xl font-bold font-tech bg-monitor-active/5 py-1 px-3 rounded-lg border border-monitor-active/20 inline-block shadow-[0_0_10px_rgba(56,189,248,0.1)]">
            ${liveChance}
          </div>
        </div>

        <div class="text-center">
          <div class="text-xs text-gray-400 font-tech uppercase tracking-[0.2em] mb-1">Video Upload</div>
          <div class="${styles.text} font-bold text-sm font-tech uppercase py-1 px-2 rounded-lg ${styles.bg} border ${styles.border}">
            ${dayObj.public.chance_ryan_makes_a_video_this_day}
          </div>
        </div>

      </div>
    `;

    container.insertAdjacentHTML("beforeend", card);
  });
}

function thresholdRoast(threshold) {
  const roastBox = document.getElementById("roast");

  let severity = "";
  let message = "";
  let classes = "";

  // ============================
  //  NEGATIVE / ANTI-WEATHER
  // ============================
  if (threshold < -500) {
    severity = "🌌 MULTIVERSE COLLAPSE";
    message = `Threshold: ${threshold}.
You have reversed weather so hard that
a parallel universe just filed a copyright claim.
Somewhere out there a tornado is UN-spinning.
Stop before gravity asks to speak with you.`;

    classes = `
      border-pink-500/40 bg-pink-500/10 text-pink-300
      animate-bounce shadow-pink-600/30
    `;
  } else if (threshold < -200) {
    severity = "💀 WEATHER COUNTERFEIT DETECTED";
    message = `Threshold: ${threshold}.
This isn’t weather. This is “off-brand weather.”
Great Value™ thunderstorms.
Dollar Tree™ thermodynamics.
Return this to the manager immediately.`;

    classes = `
      border-pink-400/40 bg-pink-400/10 text-pink-200
      shadow-lg shadow-pink-600/20
    `;
  } else if (threshold < 0) {
    severity = "🧪 BACKWARDS WEATHER";
    message = `Threshold: ${threshold}.
HOLD UP — you’re inventing ANTI-WEATHER?!
Raindrops are falling up.
Thunder is inhaling.
Wind is politely going around things.
The SPC has no form for this.`;

    classes = `
      border-pink-500/40 bg-pink-500/10 text-pink-300
      animate-bounce
    `;
  }

  // ============================
  //  LOW-END ROASTS (0–200)
  // ============================
  else if (threshold <= 50) {
    severity = "👶 BABY'S FIRST RAINDROP";
    message = `Threshold: ${threshold}.
A light breeze would fold you like a lawn chair.`;

    classes = `border-white/10 bg-white/5 text-white/70`;
  } else if (threshold <= 100) {
    severity = "☂️ UMBRELLA ENTHUSIAST";
    message = `Threshold: ${threshold}.
You see drizzle and think it's 'severe.'
The radar muted you out of embarrassment.`;

    classes = `border-white/10 bg-white/5 text-white/70`;
  } else if (threshold <= 150) {
    severity = "🌬️ SOFTCORE CHASER";
    message = `Threshold: ${threshold}.
You’re the kind of storm chaser who
goes outside only if the WiFi is strong.`;

    classes = `border-white/10 bg-white/5 text-white/70`;
  } else if (threshold <= 200) {
    severity = "🔭 WEATHER FAN ACCOUNT";
    message = `Threshold: ${threshold}.
You repost 7-day forecasts like they’re spoilers.
Relax, sunshine.`;

    classes = `border-white/10 bg-white/5 text-white/70`;
  }

  // ============================
  //  MID-TIER ROASTS (200–500)
  // ============================
  else if (threshold <= 300) {
    severity = "☁️ MERELY HUMAN";
    message = `Threshold: ${threshold}.
A respectable choice.
You still fear thunderstorms,
which is honestly healthy.`;

    classes = `border-white/10 bg-white/5 text-white/70`;
  } else if (threshold <= 400) {
    severity = "🌧️ MILDLY UNHINGED";
    message = `Threshold: ${threshold}.
You treat every rain cloud like it owes you money.`;

    classes = `border-blue-500/40 bg-blue-500/10 text-blue-300`;
  } else if (threshold <= 450) {
    severity = "🌊 DISCOUNT POSEIDON";
    message = `Threshold: ${threshold}.
You command storms, but only the clearance-rack ones.
Poseidon called — he said “bro, no.”`;

    classes = `border-blue-500/40 bg-blue-500/10 text-blue-300`;
  } else if (threshold <= 500) {
    severity = "🌩️ SEVERE THUNDERPAL";
    message = `Threshold: ${threshold}.
You and storms are on a first-name basis.
Mother Nature put you on her Close Friends list.`;

    classes = `border-purple-500/40 bg-purple-500/10 text-purple-300`;
  }

  // ============================
  //  HIGH TIER (500–2000)
  // ============================
  else if (threshold <= 1000) {
    severity = "🌪️ METEOROLOGICAL MENACE";
    message = `Threshold: ${threshold}.
You scoff at Moderate Risks.
HIGH RISK? Cute.
Wake me when the sky splits open.`;

    classes = `border-purple-500/40 bg-purple-500/10 text-purple-300`;
  } else if (threshold <= 1500) {
    severity = "⚡ SUPERCELL BRAIN";
    message = `Threshold: ${threshold}.
You require EF-8 tornadoes to feel emotions.
Even the weather models fear your expectations.`;

    classes = `border-yellow-500/40 bg-yellow-500/10 text-yellow-300`;
  } else if (threshold <= 2000) {
    severity = "🔥 CHAOTIC EVIL";
    message = `Threshold: ${threshold}.
You aren't forecasting weather anymore.
You're writing natural-disaster fanfiction.`;

    classes = `border-orange-500/40 bg-orange-500/10 text-orange-300`;
  }

  // ============================
  //  EXTREME RANGE (2000–5000)
  // ============================
  else if (threshold <= 2500) {
    severity = "🚨 OMEGA LEVEL";
    message = `Threshold: ${threshold}.
NOAA has issued a YOU WARNING.
This is no longer meteorology.
This is a problem.`;

    classes = `
      border-red-500/40 bg-red-500/10 text-red-300
      animate-pulse shadow-red-600/30
    `;
  } else if (threshold <= 3500) {
    severity = "☠️ ATMOSPHERIC FELONY";
    message = `Threshold: ${threshold}.
This is illegal in 13 counties.
Meteorologists are forming a support group.`;

    classes = `border-red-500/40 bg-red-500/10 text-red-300`;
  } else if (threshold <= 5000) {
    severity = "⚡ DIVINE INTERVENTION REQUIRED";
    message = `Threshold: ${threshold}.
Even Zeus said “nah, that’s too much.”
He left the group chat.`;

    classes = `border-indigo-500/40 bg-indigo-500/10 text-indigo-300`;
  }

  // ============================
  //  BOSS LEVEL (5000–12000)
  // ============================
  else if (threshold <= 9000) {
    severity = "🌩️ LEGENDARY WEATHER RAID BOSS";
    message = `Threshold: ${threshold}.
Storm chasers must QUEUE to face you.
Recommended level: 97+.`;

    classes = `border-amber-500/40 bg-amber-500/10 text-amber-300`;
  } else if (threshold <= 12000) {
    severity = "☄️ DRAGON BALL METEOROLOGIST";
    message = `Threshold: ${threshold}.
IT'S OVER 9000!!!
Your forecast requires a scouter to read.`;

    classes = `border-green-500/40 bg-green-500/10 text-green-300`;
  }

  // ============================
  //  GALAXY BREAKER (12000–30000)
  // ============================
  else if (threshold <= 30000) {
    severity = "🌌 GALACTIC WEATHER ENTITY";
    message = `Threshold: ${threshold}.
You've surpassed Earth weather.
Moons tremble when you check the radar.`;

    classes = `border-fuchsia-500/40 bg-fuchsia-500/10 text-fuchsia-300`;
  }

  // ============================
  //  FINAL GOD TIER
  // ============================
  else {
    severity = "🌀 OMNI-WEATHER BEING";
    message = `Threshold: ${threshold}.
You ARE the weather now.
Storms ask YOU for updates.
Ryan Hall is reacting to YOU.`;

    classes = `
      border-white/20 bg-white/10 text-white
      animate-pulse shadow-white/20
    `;
  }

  // ============================
  //  RENDER
  // ============================
  roastBox.innerHTML = `
    <div class="mt-4 p-4 rounded-md border backdrop-blur-sm ${classes} transition-all duration-500">
      <p class="text-sm font-mono whitespace-pre-line leading-relaxed">
        <strong class="font-bold">${severity}</strong><br>
        ${message}
      </p>
    </div>
  `;
}

async function updateWeatherIntensity() {
  let weather_intensity_score = 0;

  const WIS = await fetch(
    `https://public.yallsoft.app/rhy/wis.json?t=${new Date().getTime()}`,
  );
  const data = await WIS.json();

  WISData = data;
  const threshold = await fetch(
    `https://quiet-wood-94aa.nathaniel2007w.workers.dev?t=${new Date().getTime()}`,
  );
  const threshold_data = await threshold.json();
  STREAM_THRESHOLDS.STANDBY = threshold_data.thresholds?.STANDBY;
  STREAM_THRESHOLDS.ACTIVE = threshold_data.thresholds?.ACTIVE;
  STREAM_THRESHOLDS.EMERGENCY = threshold_data.thresholds?.EMERGENCY;
  thresholdRoast(STREAM_THRESHOLDS.ACTIVE);

  weather_intensity_score = data.wis.weather_intensity_score;
  // Grab full score history from API
  const history = data.score_history || [];

  // Convert it into something usable (value + timestamp)
  scoreHistory = history.map((entry) => ({
    value: parseFloat(entry.weather_intensity_score),
    timestamp: new Date(entry.timestamp).getTime(),
  }));

  // Keep only the last 60 minutes of history
  const ONE_HOUR = 60 * 60 * 1000;
  const now = Date.now();
  scoreHistory = scoreHistory.filter((r) => now - r.timestamp <= ONE_HOUR);

  // Compute 1-hour low/high
  const values = scoreHistory.map((r) => r.value);
  if (values.length > 0) {
    low = Math.min(...values);
    high = Math.max(...values);
  } else {
    low = 0;
    high = 0;
  }

  // Forecast (if provided in API)
  // Create 30-minute forecast from change deltas
  const forecastChanges = data.wis.forecast_changes || {};
  let forecastPoints = [];
  let currentForecast = weather_intensity_score;

  for (let i = 1; i <= 30; i++) {
    const delta = parseFloat(forecastChanges[`minute_${i}`]) || 0;
    currentForecast += delta; // apply change
    forecastPoints.push({
      x: i, // minutes into the future
      y: currentForecast,
    });
  }

  updateDosUI(WISData);

  const scoreElement = document.getElementById("score");
  const descElement = document.getElementById("desc");
  const lowScore = document.getElementById("lowScore");
  const highScore = document.getElementById("highScore");
  const percentElement = document.getElementById("scorePercent");
  const rhyPercentElement = document.getElementById("rhyScorePercent");
  const lucideActivityElement = document.getElementById("lucide-activity-icon");
  forecastText = `${data.wis.forecast_reasoning}`;
  updateText();

  const intensity = parseFloat(weather_intensity_score);
  let descriptor;
  if (intensity < 30)
    descriptor =
      "Mostly Quiet — Weather across the country is calm with minimal to no eYuM team activity.";
  else if (intensity < 50)
    descriptor =
      "Some Activity — Weather is occurring somewhere; monitoring continues.";
  else if (intensity < 70)
    descriptor =
      "Notable Weather — eYuM's team is in standby mode watching developing conditions.";
  else if (intensity < 100)
    descriptor =
      "Significant Events — A developing situation; live coverage may be ongoing.";
  else if (intensity < 150)
    descriptor =
      "Multiple Areas Impacted — Several regions affected by severe weather; full coverage likely.";
  else if (intensity < 250)
    descriptor =
      "Major Outbreak — Ongoing severe weather outbreak requiring all hands on deck.";
  else if (intensity < 350)
    descriptor =
      "Extreme Event — A high-end event requiring continuous live coverage.";
  else
    descriptor =
      "Potentially Historic — Scores above 500 occur only during major outbreaks per RHY team metrics.";

  scoreElement.textContent = weather_intensity_score.toFixed(2);
  document.getElementById("scoreThreshold").textContent =
    `/ ${STREAM_THRESHOLDS.ACTIVE}`;
  const percentOfThreshold =
    (weather_intensity_score / STREAM_THRESHOLDS.ACTIVE) * 100;
  const rhyPercentOfThreshold =
    (weather_intensity_score /
      data.wis.todays_stream_info.weather_intensity_score_threshold) *
    100;

  const eYuMsBar = document.getElementById("progressBar");
  const eYuMsPercentLabel = document.getElementById("percentLabel");
  const eYuMsPercentProgress = document.getElementById("progressPercent");
  const rhysBar = document.getElementById("rhyProgressBar");
  const rhysLabel = document.getElementById("rhyPercentLabel");
  const rhysPercentProgress = document.getElementById("rhyPercentProgress");

  const clampedPercent = Math.min(percentOfThreshold, 100); // cap visual fill at 200%
  const safePercent = Math.min(Math.max(percentOfThreshold, 0), 999);
  const rhyClampedPercent = Math.min(rhyPercentOfThreshold, 100);
  const rhySafePercent = Math.min(Math.max(rhyPercentOfThreshold, 0), 999);
  eYuMsBar.style.width = `${clampedPercent}%`;
  eYuMsPercentLabel.textContent = `${safePercent.toFixed(
    1,
  )}% of eYuM's Saturation`;
  eYuMsPercentProgress.textContent = `${safePercent.toFixed(1)}%`;
  rhysBar.style.width = `${rhyClampedPercent}%`;
  rhysLabel.textContent = `${rhySafePercent.toFixed(1)}% of RHY's Saturation`;
  rhysPercentProgress.textContent = `${rhySafePercent.toFixed(1)}%`;

  // Dynamic color gradient by intensity
  let barColor = "linear-gradient(90deg, #10b981, #059669)";
  if (intensity < 30)
    barColor = `linear-gradient(90deg, ${colorLerp(
      `${hexToRgba("#10b981")}`,
      `${hexToRgba("#FACC15")}`,
      intensity / 30,
      "rgb",
    )}, ${colorLerp(
      `${hexToRgba("#059669")}`,
      `${hexToRgba("#EAB308")}`,
      intensity / 30,
      "rgb",
    )})`;
  else if (intensity < 50)
    barColor = `linear-gradient(90deg, ${colorLerp(
      `${hexToRgba("#FACC15")}`,
      `${hexToRgba("#FB923C")}`,
      (intensity - 30) / 20,
      "rgb",
    )}, ${colorLerp(
      `${hexToRgba("#EAB308")}`,
      `${hexToRgba("#F97316")}`,
      (intensity - 30) / 20,
      "rgb",
    )})`;
  else if (intensity < 70)
    barColor = `linear-gradient(90deg, ${colorLerp(
      `${hexToRgba("#FB923C")}`,
      `${hexToRgba("#F87171")}`,
      (intensity - 50) / 20,
      "rgb",
    )}, ${colorLerp(
      `${hexToRgba("#F97316")}`,
      `${hexToRgba("#EF4444")}`,
      (intensity - 50) / 20,
      "rgb",
    )})`;
  else if (intensity < 100)
    barColor = `linear-gradient(90deg, ${colorLerp(
      `${hexToRgba("#F87171")}`,
      `${hexToRgba("#DC2626")}`,
      (intensity - 70) / 30,
      "rgb",
    )}, ${colorLerp(
      `${hexToRgba("#EF4444")}`,
      `${hexToRgba("#B71C1C")}`,
      (intensity - 70) / 30,
      "rgb",
    )})`;
  else if (intensity < 150)
    barColor = `linear-gradient(90deg, ${colorLerp(
      `${hexToRgba("#DC2626")}`,
      `${hexToRgba("#A855F7")}`,
      (intensity - 100) / 50,
      "rgb",
    )}, ${colorLerp(
      `${hexToRgba("#B71C1C")}`,
      `${hexToRgba("#9333EA")}`,
      (intensity - 100) / 50,
      "rgb",
    )})`;
  else if (intensity < 250)
    barColor = `linear-gradient(90deg, ${colorLerp(
      `${hexToRgba("#A855F7")}`,
      `${hexToRgba("#E879F9")}`,
      (intensity - 150) / 100,
      "rgb",
    )}, ${colorLerp(
      `${hexToRgba("#9333EA")}`,
      `${hexToRgba("#EC4899")}`,
      (intensity - 150) / 100,
      "rgb",
    )})`;
  else if (intensity < 350)
    barColor = `linear-gradient(90deg, ${colorLerp(
      `${hexToRgba("#E879F9")}`,
      `${hexToRgba("#FB7185")}`,
      (intensity - 250) / 100,
      "rgb",
    )}, ${colorLerp(
      `${hexToRgba("#EC4899")}`,
      `${hexToRgba("#F43F5E")}`,
      (intensity - 250) / 100,
      "rgb",
    )})`;
  else
    barColor = `linear-gradient(90deg, ${colorLerp(
      `${hexToRgba("#FB7185")}`,
      `${hexToRgba("#ffffff")}`,
      Math.min((intensity - 350) / 150, 1),
      "rgb",
    )}, ${colorLerp(
      `${hexToRgba("#F43F5E")}`,
      `${hexToRgba("#F3F4F6")}`,
      Math.min((intensity - 350) / 150, 1),
      "rgb",
    )})`;

  progressBar.style.background = barColor;

  let rhyBarColor = "linear-gradient(90deg, #10b981, #059669)";
  if (intensity < 30)
    rhyBarColor = `linear-gradient(90deg, ${colorLerp(
      `${hexToRgba("#10b981")}`,
      `${hexToRgba("#FACC15")}`,
      intensity / 30,
      "rgb",
    )}, ${colorLerp(
      `${hexToRgba("#059669")}`,
      `${hexToRgba("#EAB308")}`,
      intensity / 30,
      "rgb",
    )})`;
  else if (intensity < 50)
    rhyBarColor = `linear-gradient(90deg, ${colorLerp(
      `${hexToRgba("#FACC15")}`,
      `${hexToRgba("#FB923C")}`,
      (intensity - 30) / 20,
      "rgb",
    )}, ${colorLerp(
      `${hexToRgba("#EAB308")}`,
      `${hexToRgba("#F97316")}`,
      (intensity - 30) / 20,
      "rgb",
    )})`;
  else if (intensity < 70)
    rhyBarColor = `linear-gradient(90deg, ${colorLerp(
      `${hexToRgba("#FB923C")}`,
      `${hexToRgba("#F87171")}`,
      (intensity - 50) / 20,
      "rgb",
    )}, ${colorLerp(
      `${hexToRgba("#F97316")}`,
      `${hexToRgba("#EF4444")}`,
      (intensity - 50) / 20,
      "rgb",
    )})`;
  else if (intensity < 100)
    rhyBarColor = `linear-gradient(90deg, ${colorLerp(
      `${hexToRgba("#F87171")}`,
      `${hexToRgba("#DC2626")}`,
      (intensity - 70) / 30,
      "rgb",
    )}, ${colorLerp(
      `${hexToRgba("#EF4444")}`,
      `${hexToRgba("#B71C1C")}`,
      (intensity - 70) / 30,
      "rgb",
    )})`;
  else if (intensity < 150)
    rhyBarColor = `linear-gradient(90deg, ${colorLerp(
      `${hexToRgba("#DC2626")}`,
      `${hexToRgba("#A855F7")}`,
      (intensity - 100) / 50,
      "rgb",
    )}, ${colorLerp(
      `${hexToRgba("#B71C1C")}`,
      `${hexToRgba("#9333EA")}`,
      (intensity - 100) / 50,
      "rgb",
    )})`;
  else if (intensity < 250)
    rhyBarColor = `linear-gradient(90deg, ${colorLerp(
      `${hexToRgba("#A855F7")}`,
      `${hexToRgba("#E879F9")}`,
      (intensity - 150) / 100,
      "rgb",
    )}, ${colorLerp(
      `${hexToRgba("#9333EA")}`,
      `${hexToRgba("#EC4899")}`,
      (intensity - 150) / 100,
      "rgb",
    )})`;
  else if (intensity < 350)
    rhyBarColor = `linear-gradient(90deg, ${colorLerp(
      `${hexToRgba("#E879F9")}`,
      `${hexToRgba("#FB7185")}`,
      (intensity - 250) / 100,
      "rgb",
    )}, ${colorLerp(
      `${hexToRgba("#EC4899")}`,
      `${hexToRgba("#F43F5E")}`,
      (intensity - 250) / 100,
      "rgb",
    )})`;
  else
    rhyBarColor = `linear-gradient(90deg, ${colorLerp(
      `${hexToRgba("#FB7185")}`,
      `${hexToRgba("#FFFFFF")}`,
      Math.min((intensity - 350) / 150, 1),
      "rgb",
    )}, ${colorLerp(
      `${hexToRgba("#F43F5E")}`,
      `${hexToRgba("#F3F4F6")}`,
      Math.min((intensity - 350) / 150, 1),
      "rgb",
    )})`;

  rhysBar.style.background = rhyBarColor;

  // Glow effect when crossing threshold
  if (intensity >= STREAM_THRESHOLDS.EMERGENCY) {
    progressBar.style.boxShadow = "0 0 20px 4px #ff4b4b";
  } else if (intensity >= STREAM_THRESHOLDS.ACTIVE) {
    progressBar.style.boxShadow = "0 0 15px 3px #00ffc8";
  } else if (intensity >= STREAM_THRESHOLDS.STANDBY) {
    progressBar.style.boxShadow = "0 0 10px 2px #ffcc33";
  } else {
    progressBar.style.boxShadow = "none";
  }

  if (
    intensity >=
    data.wis.todays_stream_info.weather_intensity_score_threshold * 2
  ) {
    rhysBar.style.boxShadow = "0 0 20px 4px #ff4b4b";
  } else if (
    intensity >= data.wis.todays_stream_info.weather_intensity_score_threshold
  ) {
    rhysBar.style.boxShadow = "0 0 15px 3px #00ffc8";
  } else if (
    intensity >=
    data.wis.todays_stream_info.weather_intensity_score_threshold / 2
  ) {
    rhysBar.style.boxShadow = "0 0 10px 2px #ffcc33";
  } else {
    rhysBar.style.boxShadow = "none";
  }

  percentElement.textContent = `${safePercent.toFixed(
    2,
  )}% of eYuM's active threshold of ${STREAM_THRESHOLDS.ACTIVE}`;
  rhyPercentElement.textContent = `${rhySafePercent.toFixed(
    2,
  )}% of Ryan Hall Y'all's threshold of ${
    data.wis.todays_stream_info.weather_intensity_score_threshold
  }`;

  descElement.textContent = descriptor;
  lowScore.textContent = low.toFixed(2);
  highScore.textContent = high.toFixed(2);
  drawWISChart(
    document.getElementById("infoKey"),
    document.getElementById("graphScaler"),
    document.getElementById("wisGraph"),
    WISData,
    false,
  );

  descElement.style.transition = "color 1s ease";
  lowScore.style.transition = "color 1s ease";
  highScore.style.transition = "color 1s ease";

  let color = "#10b981";
  let lowScoreColor = "#10b981";
  let highScoreColor = "#10b981";
  if (intensity >= 0 && intensity < 30)
    color = colorLerp(
      `${hexToRgba("#10b981")}`,
      `${hexToRgba("#FACC15")}`,
      intensity / 30,
      "rgb",
    );
  else if (intensity >= 30 && intensity < 50)
    color = colorLerp(
      `${hexToRgba("#FACC15")}`,
      `${hexToRgba("#FB923C")}`,
      (intensity - 30) / 20,
      "rgb",
    );
  else if (intensity >= 50 && intensity < 70)
    color = colorLerp(
      `${hexToRgba("#FB923C")}`,
      `${hexToRgba("#F87171")}`,
      (intensity - 50) / 20,
      "rgb",
    );
  else if (intensity >= 70 && intensity < 100)
    color = colorLerp(
      `${hexToRgba("#F87171")}`,
      `${hexToRgba("#DC2626")}`,
      (intensity - 70) / 30,
      "rgb",
    );
  else if (intensity >= 100 && intensity < 150)
    color = colorLerp(
      `${hexToRgba("#DC2626")}`,
      `${hexToRgba("#A855F7")}`,
      (intensity - 100) / 50,
      "rgb",
    );
  else if (intensity >= 150 && intensity < 250)
    color = colorLerp(
      `${hexToRgba("#A855F7")}`,
      `${hexToRgba("#E879F9")}`,
      (intensity - 150) / 100,
      "rgb",
    );
  else if (intensity >= 250 && intensity < 350)
    color = colorLerp(
      `${hexToRgba("#E879F9")}`,
      `${hexToRgba("#FB7185")}`,
      (intensity - 250) / 100,
      "rgb",
    );
  else if (intensity >= 350)
    color = colorLerp(
      `${hexToRgba("#FB7185")}`,
      `${hexToRgba("#FFFFFF")}`,
      Math.min((intensity - 350) / 150, 1),
      "rgb",
    );
  if (low >= 0 && low < 30)
    lowScoreColor = colorLerp(
      `${hexToRgba("#10b981")}`,
      `${hexToRgba("#FACC15")}`,
      low / 30,
      "rgb",
    );
  else if (low >= 30 && low < 50)
    lowScoreColor = colorLerp(
      `${hexToRgba("#FACC15")}`,
      `${hexToRgba("#FB923C")}`,
      (low - 30) / 20,
      "rgb",
    );
  else if (low >= 50 && low < 70)
    lowScoreColor = colorLerp(
      `${hexToRgba("#FB923C")}`,
      `${hexToRgba("#F87171")}`,
      (low - 50) / 20,
      "rgb",
    );
  else if (low >= 70 && low < 100)
    lowScoreColor = colorLerp(
      `${hexToRgba("#F87171")}`,
      `${hexToRgba("#DC2626")}`,
      (low - 70) / 30,
      "rgb",
    );
  else if (low >= 100 && low < 150)
    lowScoreColor = colorLerp(
      `${hexToRgba("#DC2626")}`,
      `${hexToRgba("#A855F7")}`,
      (low - 100) / 50,
      "rgb",
    );
  else if (low >= 150 && low < 250)
    lowScoreColor = colorLerp(
      `${hexToRgba("#A855F7")}`,
      `${hexToRgba("#E879F9")}`,
      (low - 150) / 100,
      "rgb",
    );
  else if (low >= 250 && low < 350)
    lowScoreColor = colorLerp(
      `${hexToRgba("#E879F9")}`,
      `${hexToRgba("#FB7185")}`,
      (low - 250) / 100,
      "rgb",
    );
  else if (low >= 350)
    lowScoreColor = colorLerp(
      `${hexToRgba("#FB7185")}`,
      `${hexToRgba("#FFFFFF")}`,
      Math.min((low - 350) / 150, 1),
      "rgb",
    );
  if (high >= 0 && high < 30)
    highScoreColor = colorLerp(
      `${hexToRgba("#10b981")}`,
      `${hexToRgba("#FACC15")}`,
      high / 30,
      "rgb",
    );
  else if (high >= 30 && high < 50)
    highScoreColor = colorLerp(
      `${hexToRgba("#FACC15")}`,
      `${hexToRgba("#FB923C")}`,
      (high - 30) / 20,
      "rgb",
    );
  else if (high >= 50 && high < 70)
    highScoreColor = colorLerp(
      `${hexToRgba("#FB923C")}`,
      `${hexToRgba("#F87171")}`,
      (high - 50) / 20,
      "rgb",
    );
  else if (high >= 70 && high < 100)
    highScoreColor = colorLerp(
      `${hexToRgba("#F87171")}`,
      `${hexToRgba("#DC2626")}`,
      (high - 70) / 30,
      "rgb",
    );
  else if (high >= 100 && high < 150)
    highScoreColor = colorLerp(
      `${hexToRgba("#DC2626")}`,
      `${hexToRgba("#A855F7")}`,
      (high - 100) / 50,
      "rgb",
    );
  else if (high >= 150 && high < 250)
    highScoreColor = colorLerp(
      `${hexToRgba("#A855F7")}`,
      `${hexToRgba("#E879F9")}`,
      (high - 150) / 100,
      "rgb",
    );
  else if (high >= 250 && high < 350)
    highScoreColor = colorLerp(
      `${hexToRgba("#E879F9")}`,
      `${hexToRgba("#FB7185")}`,
      (high - 250) / 100,
      "rgb",
    );
  else if (high >= 350)
    highScoreColor = colorLerp(
      `${hexToRgba("#FB7185")}`,
      `${hexToRgba("#FFFFFF")}`,
      Math.min((high - 350) / 150, 1),
      "rgb",
    );

  if (lastIntensity !== 0) {
    if (intensity !== lastIntensity) {
      scoreElement.classList.add("text-monitor-active", "scale-110");
      scoreElement.classList.remove("text-white");
      lucideActivityElement.classList.add(
        "text-monitor-active",
        "animate-pulse",
      );
      lucideActivityElement.classList.remove("text-gray-500");
    }
  }

  setTimeout(() => {
    scoreElement.classList.remove("text-monitor-active");
    lucideActivityElement.classList.remove(
      "text-monitor-active",
      "animate-pulse",
    );
    lucideActivityElement.classList.add("text-gray-500");
    descElement.style.color = color;
    scoreElement.classList.remove("scale-110");
    lowScore.style.color = lowScoreColor;
    highScore.style.color = highScoreColor;
  }, 500);

  lastIntensity = intensity;
}

const API_KEY = "AIzaSyBIMr2aZ9ckD3i4LWjfEZzCe9QI1vBVQHk";
const CHANNEL_ID = "UC7oyDxYPvLI-uF4NeeLFleQ";

// Step 1: Get the uploads playlist
async function getUploadsPlaylist(channelId) {
  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}&key=${API_KEY}`,
  );
  const data = await res.json();
  return data.items[0].contentDetails.relatedPlaylists.uploads;
}

// Step 2: Fetch recent videos from the uploads playlist
async function getRecentVideos(playlistId, maxResults = 10) {
  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=${maxResults}&key=${API_KEY}`,
  );
  const data = await res.json();
  return data.items.map((item) => item.snippet.resourceId.videoId);
}

// Step 3: Fetch full video details
async function getVideoDetails(videoIds) {
  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=snippet,liveStreamingDetails,statistics&id=${videoIds.join(
      ",",
    )}&key=${API_KEY}`,
  );
  const data = await res.json();
  return data.items;
}

// Step 4: Pick latest video and streams
function pickLatest(videos) {
  let latestVideo = null;
  let latestPastStream = null;
  let currentlyLive = null;

  const now = new Date();

  for (const video of videos) {
    const ls = video.liveStreamingDetails;
    if (ls) {
      const endTime = ls.actualEndTime ? new Date(ls.actualEndTime) : null;
      const startTime = ls.actualStartTime
        ? new Date(ls.actualStartTime)
        : null;

      if (!endTime || (startTime && !endTime && now >= startTime)) {
        // Video is currently live
        if (!currentlyLive) currentlyLive = video;
      } else {
        // Past live stream
        if (!latestPastStream) latestPastStream = video;
      }
    } else {
      // Regular upload
      if (!latestVideo) latestVideo = video;
    }

    if (latestVideo && latestPastStream && currentlyLive) break;
  }

  return { latestVideo, latestPastStream, currentlyLive };
}

// Step 5: Render in your page
function embedVideo(videoId, containerId, title) {
  const container = document.getElementById(containerId);

  // Set the initial thumbnail/button HTML
  container.innerHTML = `
    <button
      class="relative group cursor-pointer bg-black absolute inset-0 w-full h-full"
      aria-label="${title}"
    >
      <img
        src="https://i.ytimg.com/vi/${videoId}/hqdefault.jpg"
        alt="${title}"
        class="w-full h-full object-cover"
        loading="lazy"
      >
      <div
        class="absolute inset-0 flex items-center justify-center"
      >
        <div
          class="w-16 h-16 md:w-20 md:h-20 bg-red-600 rounded-full flex items-center justify-center group-hover:bg-red-700 group-hover:scale-110 transition-all shadow-lg"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="lucide lucide-play w-8 h-8 md:w-10 md:h-10 text-white fill-white ml-1"
          >
            <polygon points="6 3 20 12 6 21 6 3"></polygon>
          </svg>
        </div>
      </div>
    </button>
  `;

  // Add click listener to replace with iframe
  const button = container.querySelector("button");
  button.addEventListener("click", () => {
    container.innerHTML = `
      <iframe
        src="https://www.youtube.com/embed/${videoId}?autoplay=1"
        title="${title}"
        class="absolute inset-0 w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
      ></iframe>
    `;
  });
}

function embedVideoTitle(title, containerId) {
  document.getElementById(containerId).textContent = `${title}`;
}

function formatNumber(num) {
  if (num < 1000) return num.toString();

  const units = ["K", "M", "B", "T"];
  const order = Math.floor(Math.log10(num) / 3);
  const unit = units[order - 1];
  const truncated = num / Math.pow(1000, order);

  return `${truncated.toFixed(truncated < 10 ? 2 : 1)}${unit}`;
}

function getScheduledRTF(scheduledAt) {
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "always" });
  const now = new Date();
  const diffMs = new Date(scheduledAt) - now; // future time

  if (diffMs <= 0) return "starting now";

  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffMonths / 12);

  if (diffSeconds < 60)
    return rtf.format(diffSeconds, "seconds"); // future = positive
  else if (diffMinutes < 60) return rtf.format(diffMinutes, "minutes");
  else if (diffHours < 24) return rtf.format(diffHours, "hours");
  else if (diffDays < 7) return rtf.format(diffDays, "days");
  else if (diffDays < 30) return rtf.format(diffWeeks, "weeks");
  else if (diffMonths < 12) return rtf.format(diffMonths, "months");
  else return rtf.format(diffYears, "years");
}

function embedVideoInfo(item, prefix, containerId) {
  const liveStreamingDetails = item.liveStreamingDetails;
  const timePublishedAt = item.snippet.publishedAt;
  const stats = item.statistics;

  let timeAgo;
  if (
    liveStreamingDetails?.scheduledStartTime &&
    !liveStreamingDetails?.actualStartTime
  ) {
    timeAgo = getScheduledRTF(liveStreamingDetails.scheduledStartTime);
  } else {
    const rtf = new Intl.RelativeTimeFormat("en", { numeric: "always" });

    const publishedAt = liveStreamingDetails?.actualStartTime
      ? new Date(liveStreamingDetails.actualStartTime)
      : liveStreamingDetails !== undefined
        ? new Date(liveStreamingDetails.scheduledStartTime)
        : new Date(timePublishedAt);
    const now = new Date();
    const diffMs = Math.abs(now - publishedAt);
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffMonths / 12);

    if (diffSeconds < 60) timeAgo = `${rtf?.format(-diffSeconds, "seconds")}`;
    else if (diffMinutes < 60)
      timeAgo = `${rtf?.format(-diffMinutes, "minutes")}`;
    else if (diffHours < 24) timeAgo = `${rtf?.format(-diffHours, "hours")}`;
    else if (diffDays < 7) timeAgo = `${rtf?.format(-diffDays, "days")}`;
    else if (diffDays < 30) timeAgo = `${rtf?.format(-diffWeeks, "weeks")}`;
    else if (diffMonths < 12) timeAgo = `${rtf?.format(-diffMonths, "months")}`;
    else if (isFinite(diffYears))
      timeAgo = `${rtf?.format(-diffYears, "years")}`;
    else timeAgo = "";
  }

  document.getElementById(containerId).innerHTML = `
  <div class="flex items-center gap-1.5">
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-clock w-3.5 h-3.5 sm:w-4 sm:h-4">
      <circle cx="12" cy="12" r="10"></circle>
      <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
    <span class="truncate">${prefix}${timeAgo}</span>
  </div>
  <div class="flex items-center gap-1.5">
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-eye w-3.5 h-3.5 sm:w-4 sm:h-4">
      <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>
    <span class="truncate">${formatNumber(stats.viewCount)} views</span>
  </div>`;
}

let previous = {
  streamId: null,
  videoId: null,
};

function updateLiveStatusUI(currentlyLive, latestPastStream) {
  const mainBadge = document.getElementById("liveStateBadge");
  const statusBadge = document.getElementById("liveStreamStatus");

  if (!mainBadge || !statusBadge) return; // safety

  // CASE 1 — LIVE NOW
  if (currentlyLive) {
    mainBadge.textContent = "LIVE NOW";
    mainBadge.classList.remove("bg-secondary", "text-secondary-foreground");
    mainBadge.classList.add("bg-red-500", "text-white");

    statusBadge.style.display = "none"; // hide NOT LIVE
    return;
  }

  // CASE 2 — NOT LIVE but past streams exist
  if (!currentlyLive && latestPastStream) {
    mainBadge.textContent = "LATEST STREAM";

    mainBadge.classList.remove("bg-red-500", "text-white");
    mainBadge.classList.add("bg-secondary", "text-secondary-foreground");

    statusBadge.style.display = "inline-block";
    statusBadge.textContent = "NOT LIVE";
    return;
  }

  // CASE 3 — No streams at all
  mainBadge.textContent = "LATEST STREAM";
  statusBadge.style.display = "inline-block";
  statusBadge.textContent = "No streams found";
}

async function showLatestContent() {
  const playlistId = await getUploadsPlaylist(CHANNEL_ID);
  const videoIds = await getRecentVideos(playlistId, 10);
  const videos = await getVideoDetails(videoIds);

  const { latestVideo, latestPastStream, currentlyLive } = pickLatest(videos);

  updateLiveStatusUI(currentlyLive, latestPastStream);

  let newStreamId = currentlyLive?.id || latestPastStream?.id || null;
  let newVideoId = latestVideo?.id || null;
  let data = currentlyLive || latestPastStream;

  // --- STREAM HANDLING ---
  if (newStreamId && newStreamId !== previous.streamId) {
    // Only update iframe + info if the video actually changed
    embedVideo(newStreamId, "eYuMs-latest-stream", data.snippet.title);
    embedVideoTitle(data.snippet.title, "eYuMs-latest-stream-name");

    previous.streamId = newStreamId; // update cache
  }

  // --- LATEST UPLOADED VIDEO HANDLING ---
  if (newVideoId && newVideoId !== previous.videoId) {
    embedVideo(newVideoId, "eYuMs-latest-video", latestVideo.snippet.title);
    embedVideoTitle(latestVideo.snippet.title, "eYuMs-latest-video-title");

    previous.videoId = newVideoId; // update cache
  }

  let prefix;
  if (currentlyLive?.liveStreamingDetails?.actualStartTime) {
    prefix = "Started streaming ";
  } else if (currentlyLive?.liveStreamingDetails?.scheduledStartTime) {
    prefix = "Stream ";
  } else {
    prefix = "Streamed ";
  }
  embedVideoInfo(data, prefix, "eYuMs-latest-stream-info");
  embedVideoInfo(latestVideo, "", "eYuMs-latest-video-info");
}

// ===========================================
// RGB ↔ HSL CONVERSIONS
// ===========================================

function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0,
    s = 0,
    l = (max + min) / 2;

  if (delta !== 0) {
    if (max === r) h = ((g - b) / delta) % 6;
    else if (max === g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;

    h *= 60;
    if (h < 0) h += 360;

    s = delta / (1 - Math.abs(2 * l - 1));
  }

  return { h, s: s * 100, l: l * 100 };
}

function hslToRgb(h, s, l) {
  s /= 100;
  l /= 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0,
    g = 0,
    b = 0;

  if (h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (h < 300) {
    r = x;
    g = 0;
    b = c;
  } else {
    r = c;
    g = 0;
    b = x;
  }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

// ===========================================
// PARSERS (rgb(...) or hsl(...))
// ===========================================

function parseColor(color) {
  if (color.startsWith("rgb")) {
    const nums = color.match(/[\d.]+/g).map(Number);
    const [r, g, b, a = 1] = nums;
    return { space: "rgb", r, g, b, a };
  }

  if (color.startsWith("hsl")) {
    const nums = color.match(/[\d.]+/g).map(Number);
    const [h, s, l, a = 1] = nums;
    return { space: "hsl", h, s, l, a };
  }

  throw new Error("Unsupported color format: " + color);
}

// ===========================================
// HSL INTERPOLATION WITH HUE WRAP
// ===========================================

function lerpHSL(a, b, t) {
  let { h: h1, s: s1, l: l1 } = a;
  let { h: h2, s: s2, l: l2 } = b;

  // shortest path around the color wheel
  let dh = h2 - h1;
  if (dh > 180) dh -= 360;
  if (dh < -180) dh += 360;

  return {
    h: (h1 + dh * t + 360) % 360,
    s: s1 + (s2 - s1) * t,
    l: l1 + (l2 - l1) * t,
  };
}

// ===========================================
// MAIN FUNCTION: colorLerp()
// ===========================================

function colorLerp(start, end, t, outputSpace = "rgb") {
  const s = parseColor(start);
  const e = parseColor(end);

  const sHSL =
    s.space === "rgb" ? rgbToHsl(s.r, s.g, s.b) : { h: s.h, s: s.s, l: s.l };
  const eHSL =
    e.space === "rgb" ? rgbToHsl(e.r, e.g, e.b) : { h: e.h, s: e.s, l: e.l };

  // Interpolate in HSL
  const outHSL = lerpHSL(sHSL, eHSL, t);

  // Alpha lerp
  const alpha = lerp(s.a ?? 1, e.a ?? 1, t);

  // Output format
  if (outputSpace === "hsl") {
    return `hsla(${outHSL.h}, ${outHSL.s}%, ${outHSL.l}%, ${alpha})`;
  }

  const rgb = hslToRgb(outHSL.h, outHSL.s, outHSL.l);
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

// ==========================
// RUN ALL
// ==========================
function startMainUI() {
  showLatestContent();
  fetchChannelInfo(CHANNEL_ID, API_KEY);
  updateChannelUIFromCache();
  updateWeatherIntensity();
  updateWISChartSize();
  populateTopWarning();
  initHeadlines();

  setInterval(
    () => {
      fetchChannelInfo(CHANNEL_ID, API_KEY);
    },
    5 * 60 * 1000,
  );
  setInterval(
    () => {
      showLatestContent();
    },
    1 * 60 * 1000,
  );
  setInterval(updateChannelUIFromCache, 5000);
  setInterval(() => {
    updateWeatherIntensity();
    populateTopWarning();
  }, 10000);
  setInterval(() => {
    if (!headlines.length) return;
    const next = (activeHeadline + 1) % headlines.length;
    updateHeadline(next);
    setActiveDot(next);
  }, 7000);
}

startMainUI();

window.addEventListener("resize", () => {
  if (menuOpen) positionToolsMenu();
});
