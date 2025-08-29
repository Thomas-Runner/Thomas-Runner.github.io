
// Sample realistic data for 7 days
const runs = [
  { date: '2025-08-23', type: 'Easy Run', distance_km: 8.2, time_min: 41 },
  { date: '2025-08-24', type: 'Trail Run', distance_km: 12.6, time_min: 85 },
  { date: '2025-08-25', type: 'Restorative Jog', distance_km: 5.0, time_min: 28 },
  { date: '2025-08-26', type: 'Intervals', distance_km: 10.0, time_min: 50 },
  { date: '2025-08-27', type: 'Tempo Run', distance_km: 14.0, time_min: 64 },
  { date: '2025-08-28', type: 'Recovery', distance_km: 6.3, time_min: 35 },
  { date: '2025-08-29', type: 'Long Run', distance_km: 20.2, time_min: 110 },
];

function minsToHMM(mins){
  const h = Math.floor(mins/60);
  const m = Math.round(mins%60);
  return h>0 ? `${h}:${String(m).padStart(2,'0')}` : `${m}m`;
}

function paceFrom(distance_km, time_min){
  const pace = time_min / distance_km; // min/km
  const min = Math.floor(pace);
  const sec = Math.round((pace - min) * 60);
  return `${min}:${String(sec).padStart(2,'0')}/km`;
}

// Render run cards
const grid = document.getElementById('runs-grid');
runs.forEach(run => {
  const card = document.createElement('div');
  card.className = 'run-card';
  card.innerHTML = `
    <div class="run-date">${new Date(run.date).toLocaleDateString('en-GB',{weekday:'short', day:'2-digit', month:'short'})}</div>
    <div class="run-type">${run.type}</div>
    <div class="run-meta">
      <span>${run.distance_km.toFixed(2)} km</span>
      <span>${minsToHMM(run.time_min)}</span>
    </div>
  `;
  grid.appendChild(card);
});

// Summary box
const totalDist = runs.reduce((s,r)=>s+r.distance_km,0);
const totalTime = runs.reduce((s,r)=>s+r.time_min,0);
document.getElementById('sum-distance').textContent = totalDist.toFixed(2) + ' km';
document.getElementById('sum-time').textContent = minsToHMM(totalTime);
document.getElementById('sum-pace').textContent = paceFrom(totalDist, totalTime);

// Placeholder metric values (derived)
document.getElementById('m-weekly').textContent = totalDist.toFixed(2) + ' km';
document.getElementById('m-pace').textContent = paceFrom(totalDist, totalTime);
document.getElementById('m-elev').textContent = '640 m';
document.getElementById('m-longest').textContent = Math.max(...runs.map(r=>r.distance_km)).toFixed(2) + ' km';
document.getElementById('m-streak').textContent = '9 days';

// Accordion behavior (collapse content but keep sidebar width)
const toggle = document.querySelector('.accordion-toggle');
const content = document.querySelector('.accordion-content');
toggle.addEventListener('click', () => {
  const expanded = toggle.getAttribute('aria-expanded') === 'true';
  toggle.setAttribute('aria-expanded', String(!expanded));
  if(expanded){
    content.classList.remove('open');
    content.style.maxHeight = '0px';
  }else{
    content.classList.add('open');
    content.style.maxHeight = '900px';
  }
});
