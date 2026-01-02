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
