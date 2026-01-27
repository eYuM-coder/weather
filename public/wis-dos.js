let WISData;
let lastIntensity = 0;
let low = 0;
let high = 0;
let STREAM_THRESHOLDS = {
  STANDBY: 0,
  ACTIVE: 0,
};

let displayThreshold = true;

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
        Show less`;
  } else {
    forecastAnalysis.textContent =
      forecastText.length > maxChars
        ? forecastText.slice(0, maxChars) + "..."
        : forecastText;
    toggleForecastLength.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m6 9 6 6 6-6" />
        </svg>
        Show more`;
  }
}

toggleForecastLength.addEventListener("click", () => {
  expanded = !expanded;
  updateText();
});

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
      "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80 gap-2 animate-pulse",
    );
    statusBadge.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-radio w-4 h-4"><path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"></path><path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5"></path><circle cx="12" cy="12" r="2"></circle><path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5"></path><path d="M19.1 4.9C23 8.8 23 15.1 19.1 19"></path></svg>LIVE NOW`;
  } else if (currentStatus === "standby") {
    statusBadge.setAttribute(
      "class",
      "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 gap-2 animate-pulse",
    );
    statusBadge.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-info w-4 h-4 flex-shrink-0"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>STANDING BY`;
  } else {
    statusBadge.setAttribute(
      "class",
      "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-foreground gap-2",
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
    ctx.strokeStyle = "#10b981";
    ctx.lineWidth = 3;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.lineJoin = "round";

    historyPoints.forEach((point, index) => {
      index === 0 ? ctx.moveTo(point.x, point.y) : ctx.lineTo(point.x, point.y);
    });

    ctx.lineTo(timeToPixel(now), yToPixel(data.wis.weather_intensity_score));
    ctx.stroke();
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
  ctx.fillStyle = `rgba(16, 185, 129, ${0.3 * pulse})`;
  ctx.beginPath();
  ctx.arc(nowX, nowY, radius + 5, 0, 2 * Math.PI);
  ctx.fill();

  ctx.fillStyle = "#10b981";
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

  // === Update graph ===
  const historyData = scoreHistory.map((entry) => ({
    x: new Date(entry.timestamp),
    y: entry.value,
  }));

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

  const eYuMsPercentLabel = document.getElementById("percentLabel");
  const rhysLabel = document.getElementById("rhyPercentLabel");
  const safePercent = Math.min(Math.max(percentOfThreshold, 0), 999);
  const rhySafePercent = Math.min(Math.max(rhyPercentOfThreshold, 0), 999);
  eYuMsPercentLabel.textContent = `${safePercent.toFixed(
    1,
  )}% of eYuM's Saturation`;
  rhysLabel.textContent = `${rhySafePercent.toFixed(1)}% of RHY's Saturation`;
  drawWISChart(
    document.getElementById("infoKey"),
    document.getElementById("graphScaler"),
    document.getElementById("wisGraph"),
    WISData,
    false,
  );

  let color = "rgb(74, 222, 128)";
  if (intensity >= 0 && intensity < 30) color = "rgb(74, 222, 128)";
  else if (intensity >= 30 && intensity < 50) color = "rgb(253, 224, 71)";
  else if (intensity >= 50 && intensity < 70) color = "rgb(251, 146, 60)";
  else if (intensity >= 70 && intensity < 100) color = "rgb(248, 113, 113)";
  else if (intensity >= 100 && intensity < 150) color = "rgb(220, 38, 38)";
  else if (intensity >= 150 && intensity < 250) color = "rgb(168, 85, 247)";
  else if (intensity >= 250 && intensity < 350) color = "rgb(232, 121, 249)";

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

updateWeatherIntensity();
updateWISChartSize();
setInterval(updateWeatherIntensity, 10000);

window.addEventListener("resize", () => {
  if (menuOpen) positionToolsMenu();
});
