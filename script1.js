// === 7-Day Summary Manual Loader ===

// Placeholder 7-day summary data
let weekData = [
  { day: "Monday", type: "", distance: 0, time: 0 },
  { day: "Tuesday", type: "", distance: 0, time: 0 },
  { day: "Wednesday", type: "", distance: 0, time: 0 },
  { day: "Thursday", type: "", distance: 0, time: 0 },
  { day: "Friday", type: "", distance: 0, time: 0 },
  { day: "Saturday", type: "", distance: 0, time: 0 },
  { day: "Sunday", type: "", distance: 0, time: 0 },
];

// Convert seconds to hh:mm:ss
function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h ? h + ":" : ""}${m.toString().padStart(2,"0")}:${s.toString().padStart(2,"0")}`;
}

// Render the 7-day summary boxes
function renderWeek() {
  const grid = document.getElementById("runs-grid");
  grid.innerHTML = ""; // clear existing boxes

  weekData.forEach((dayData, index) => {
    const box = document.createElement("div");
    box.className = "run-box";
    box.innerHTML = `
      <div class="day">${dayData.day}</div>
      <div class="type">Type: ${dayData.type || "-"}</div>
      <div class="distance">Distance: ${dayData.distance.toFixed(2)} km</div>
      <div class="time">Time: ${formatTime(dayData.time)}</div>
    `;
    grid.appendChild(box);
  });

  // Update 8th summary box
  const summaryBox = document.getElementById("runs-summary");
  const totalDistance = weekData.reduce((sum, d) => sum + d.distance, 0);
  const totalTime = weekData.reduce((sum, d) => sum + d.time, 0);
  summaryBox.innerHTML = `
    <h3>7‑Day Total</h3>
    <div class="summary-line"><span>Distance</span><span>${totalDistance.toFixed(2)} km</span></div>
    <div class="summary-line"><span>Time</span><span>${formatTime(totalTime)}</span></div>
    <div class="summary-line"><span>Avg Pace</span><span>${totalDistance ? formatTime(totalTime / totalDistance) + " / km" : "-"}</span></div>
  `;
}

// Manual button handler to update week data
function manualUpdateWeek() {
  weekData = weekData.map(day => {
    const type = prompt(`Enter activity type for ${day.day}:`, day.type || "");
    const distance = parseFloat(prompt(`Enter distance (km) for ${day.day}:`, day.distance)) || 0;
    const timeParts = prompt(`Enter time for ${day.day} (hh:mm:ss):`, formatTime(day.time)).split(":");
    let time = 0;
    if (timeParts.length === 3) time = +timeParts[0]*3600 + +timeParts[1]*60 + +timeParts[2];
    else if (timeParts.length === 2) time = +timeParts[0]*60 + +timeParts[1];
    else time = +timeParts[0];
    return { ...day, type, distance, time };
  });

  renderWeek();
}

// Initialize page
document.addEventListener("DOMContentLoaded", () => {
  renderWeek();

  // Attach manual update button
  const btn = document.getElementById("manual-update-btn");
  if (btn) btn.addEventListener("click", manualUpdateWeek);
});
