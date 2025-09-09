// Gestion pause/play
document.getElementById('pauseBtn').addEventListener('click', function() {
  paused = !paused;
  this.textContent = paused ? '▶' : '⏸';
});

// Code camemberts identique au précédent mais adapté
function drawClockCharts() {
  if (!window.D90 || D90.length === 0) return;
  drawClock24h();
  drawClock12h();
}

function drawClock24h() {
  const canvas = document.getElementById('clock24h');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  const centerX = 75;
  const centerY = 75;
  const radius = 60;
  
  ctx.clearRect(0, 0, 150, 150);
  
  const hourlyAverages = calculateHourlyAverages(0, 24);
  
  for (let hour = 0; hour < 24; hour++) {
    const startAngle = (hour * 15 - 90) * Math.PI / 180;
    const endAngle = ((hour + 1) * 15 - 90) * Math.PI / 180;
    
    const average = hourlyAverages[hour];
    const color = getGlucoseColor(average);
    
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = '#1f2b3b';
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  
  drawClockGraduations(ctx, centerX, centerY, radius, 24);
}

function drawClock12h() {
  const canvas = document.getElementById('clock12h');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  const centerX = 75;
  const centerY = 75;
  const radius = 60;
  
  ctx.clearRect(0, 0, 150, 150);
  
  const hourlyAverages = calculateHourlyAverages(12, 24);
  
  for (let hour = 12; hour < 24; hour++) {
    const segmentIndex = hour - 12;
    const startAngle = (segmentIndex * 30 - 90) * Math.PI / 180;
    const endAngle = ((segmentIndex + 1) * 30 - 90) * Math.PI / 180;
    
    const average = hourlyAverages[hour];
    const color = getGlucoseColor(average);
    
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = '#1f2b3b';
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  
  drawClockGraduations(ctx, centerX, centerY, radius, 12);
}

function calculateHourlyAverages(startHour, endHour) {
  const averages = {};
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  for (let hour = startHour; hour < endHour; hour++) {
    const hourStart = new Date(today.getTime() + hour * 3600000);
    const hourEnd = new Date(hourStart.getTime() + 3600000);
    
    const valuesInHour = D90.filter(entry => {
      const entryTime = new Date(entry.date);
      return entryTime >= hourStart && entryTime < hourEnd;
    });
    
    if (valuesInHour.length > 0) {
      const sum = valuesInHour.reduce((acc, entry) => acc + entry.sgv, 0);
      averages[hour] = sum / valuesInHour.length;
    } else {
      averages[hour] = null;
    }
  }
  
  return averages;
}

function drawClockGraduations(ctx, centerX, centerY, radius, segments) {
  const graduationLength = 5;
  const segmentAngle = 360 / segments;
  
  for (let i = 0; i < segments; i++) {
    const angle = (i * segmentAngle - 90) * Math.PI / 180;
    const x1 = centerX + (radius - graduationLength) * Math.cos(angle);
    const y1 = centerY + (radius - graduationLength) * Math.sin(angle);
    const x2 = centerX + radius * Math.cos(angle);
    const y2 = centerY + radius * Math.sin(angle);
    
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = '#9aa4b2';
    ctx.lineWidth = i % (segments / 4) === 0 ? 2 : 1;
    ctx.stroke();
  }
}

function getGlucoseColor(glucose) {
  if (glucose === null || glucose === undefined) {
    return '#444444';
  }
  
  if (glucose < 70 || glucose > 200) {
    return '#ef4444';
  } else if ((glucose >= 70 && glucose < 90) || (glucose > 180 && glucose <= 200)) {
    return '#f59e0b';
  } else {
    return '#22c55e';
  }
}
