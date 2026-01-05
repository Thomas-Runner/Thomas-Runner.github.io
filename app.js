async function loadCSV(path) {
  const response = await fetch(path);
  const text = await response.text();

  const lines = text.trim().split("\n");
  const headers = lines[0].split(",");

  return lines.slice(1).map(line => {
    const values = line.split(",");
    const obj = {};
    headers.forEach((h, i) => obj[h] = values[i]);
    return obj;
  });
}

function getWeekKey(dateStr) {
  const date = new Date(dateStr);
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDays = (date - firstDayOfYear) / 86400000;
  const week = Math.ceil((pastDays + firstDayOfYear.getDay() + 1) / 7);
  return `${date.getFullYear()}-W${week}`;
}

async function renderWeeklyMileage() {
  const runs = await loadCSV("data/runs.csv");

  const weeklyTotals = {};

  runs.forEach(run => {
    const week = getWeekKey(run.date);
    const distance = parseFloat(run.distance_km);

    if (!weeklyTotals[week]) {
      weeklyTotals[week] = 0;
    }
    weeklyTotals[week] += distance;
  });

  const labels = Object.keys(weeklyTotals).sort();
  const data = labels.map(week => weeklyTotals[week]);

  const ctx = document.getElementById("weeklyMileageChart");

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [{
        label: "Weekly Distance (km)",
        data: data
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

renderWeeklyMileage();

function getStartOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

function isInCurrentWeek(dateStr) {
  const today = new Date();
  const startOfWeek = getStartOfWeek(today);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 6);

  const date = new Date(dateStr);
  return date >= startOfWeek && date <= endOfWeek;
}

async function renderThisWeeksTraining() {
  const plan = await loadCSV("data/training_plan.csv");
  const tbody = document.querySelector("#trainingTable tbody");

  const thisWeek = plan
    .filter(entry => isInCurrentWeek(entry.date))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  tbody.innerHTML = "";

  if (thisWeek.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4">No training planned this week</td></tr>`;
    return;
  }

  thisWeek.forEach(entry => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${entry.date}</td>
      <td>${entry.planned_distance_km}</td>
      <td>${entry.planned_type}</td>
      <td>${entry.notes || ""}</td>
    `;
    tbody.appendChild(row);
  });
}

renderThisWeeksTraining();
function formatTime(seconds) {
  if (!seconds) return "";
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hrs > 0) {
    return `${hrs}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

async function renderPBsAndGoals() {
  const races = await loadCSV("data/races.csv");
  const goals = await loadCSV("data/pbs_goals.csv");

  // Build PB map from race + split data
  const pbMap = {};

  races.forEach(entry => {
    const dist = parseFloat(entry.distance_km);
    const time = parseInt(entry.time_sec);

    if (!pbMap[dist] || time < pbMap[dist].time) {
      pbMap[dist] = {
        time,
        source: entry.source,
        event: entry.event_name
      };
    }
  });

  const tbody = document.querySelector("#pbsTable tbody");
  tbody.innerHTML = "";

  goals.forEach(goal => {
    const dist = parseFloat(goal.distance_km);
    const goalTime = parseInt(goal.goal_time_sec);
    const pb = pbMap[dist];

    let diff = "";
    if (pb && goalTime) {
      const delta = pb.time - goalTime;
      diff = delta > 0
        ? `-${formatTime(delta)}`
        : `+${formatTime(Math.abs(delta))}`;
    }

    const sourceNote = pb
      ? pb.source === "split" ? " (split)" : ""
      : "";

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${dist}</td>
      <td>${pb ? formatTime(pb.time) + sourceNote : ""}</td>
      <td>${formatTime(goalTime)}</td>
      <td>${diff}</td>
    `;
    tbody.appendChild(row);
  });
}


renderPBsAndGoals();
function groupRunsByWeek(runs) {
  const weeks = {};

  runs.forEach(run => {
    const week = getWeekKey(run.date);
    if (!weeks[week]) {
      weeks[week] = { count: 0, distance: 0 };
    }
    weeks[week].count += 1;
    weeks[week].distance += parseFloat(run.distance_km);
  });

  return weeks;
}
async function renderRunsPerWeek() {
  const runs = await loadCSV("data/runs.csv");
  const weeklyData = groupRunsByWeek(runs);

  const labels = Object.keys(weeklyData).sort();
  const data = labels.map(week => weeklyData[week].count);

  const ctx = document.getElementById("runsPerWeekChart");

  new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Runs per Week",
        data
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1
          }
        }
      }
    }
  });
}
function calculateTrainingStreak(weeklyData) {
  const weeks = Object.keys(weeklyData).sort().reverse();
  let streak = 0;

  for (const week of weeks) {
    if (weeklyData[week].count > 0) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}
async function renderTrainingStreak() {
  const runs = await loadCSV("data/runs.csv");
  const weeklyData = groupRunsByWeek(runs);
  const streak = calculateTrainingStreak(weeklyData);

  const el = document.getElementById("trainingStreak");
  el.textContent = `Current training streak: ${streak} week(s)`;
}
renderRunsPerWeek();
renderTrainingStreak();

