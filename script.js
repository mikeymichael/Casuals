let workers = JSON.parse(localStorage.getItem('workersData')) || [{
  name: 'John Doe', idNumber: '001', phone: '0712345678', residence: 'Nairobi',
  attendance: [
    { date: '2025-07-01', pay: 500 },
    { date: '2025-07-02', pay: 600 },
    { date: '2025-07-03' }
  ]
}];

function saveWorkers() {
  localStorage.setItem('workersData', JSON.stringify(workers));
}

function navigate(id) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  const section = document.getElementById(id);
  if (section) {
    section.classList.add('active');
    if (id === 'dashboard') renderDashboard();
    if (id === 'workers') renderWorkers();
    if (id === 'attendance') renderAttendanceOptions();
  }
}

function renderDashboard() {
  const now = new Date();
  const month = now.getMonth();
  const weekDates = [...Array(7)].map((_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  });

  let total = 0, monthTotal = 0, unpaid = 0;
  let topWorker = '-', maxPay = 0, lastDate = '-';

  workers.forEach(w => {
    let weekPay = 0, missed = 0, monthlyPay = 0;
    (w.attendance || []).forEach(a => {
      const adate = a.date;
      const pay = a.pay || 0;
      if (weekDates.includes(adate)) weekPay += pay;
      if (!a.pay) missed++;
      if (new Date(adate).getMonth() === month) monthlyPay += pay;
      if (!lastDate || new Date(adate) > new Date(lastDate)) lastDate = adate;
    });
    if (monthlyPay > maxPay) {
      topWorker = w.name;
      maxPay = monthlyPay;
    }
    total += weekPay;
    monthTotal += monthlyPay;
    unpaid += missed;
  });

  document.getElementById('dash-cards').innerHTML = `
    <div class="card"><strong>Total Workers</strong><br>${workers.length}</div>
    <div class="card"><strong>Total Weekly Pay</strong><br>KSH ${total}</div>
    <div class="card"><strong>Total Monthly Pay</strong><br>KSH ${monthTotal}</div>
    <div class="card"><strong>Unpaid Days</strong><br>${unpaid}</div>
    <div class="card"><strong>Top Earner</strong><br>${topWorker} (${maxPay})</div>
    <div class="card"><strong>Last Attendance</strong><br>${lastDate}</div>
  `;

  renderChart(weekDates.reverse());
}

function renderChart(weekDates) {
  const ctx = document.getElementById('payChart').getContext('2d');
  const labels = weekDates.map(d => new Date(d).toLocaleDateString('en-US', { weekday: 'short' }));
  const totals = weekDates.map(date => {
    return workers.reduce((sum, w) => {
      return sum + (w.attendance || []).filter(a => a.date === date).reduce((s, a) => s + (a.pay || 0), 0);
    }, 0);
  });

  if (window.payChart) window.payChart.destroy();

  window.payChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{ label: 'Pay (KSH)', data: totals, backgroundColor: '#0a74da' }]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

function renderWorkers() {
  const rows = workers.map((w, i) => `
    <tr>
      <td>${w.name}</td>
      <td>${w.idNumber}</td>
      <td>${w.phone}</td>
      <td>${w.residence}</td>
      <td><button onclick="deleteWorker(${i})">Delete</button></td>
    </tr>
  `);
  document.querySelector('#workers-table tbody').innerHTML = rows.join('');
}

function deleteWorker(i) {
  if (confirm("Are you sure you want to delete this worker?")) {
    workers.splice(i, 1);
    saveWorkers();
    renderWorkers();
    renderDashboard();
  }
}

function renderAttendanceOptions() {
  const select = document.getElementById('select-worker');
  select.innerHTML = workers.map((w, i) => `<option value="${i}">${w.name} (${w.idNumber})</option>`).join('');
}

document.getElementById('worker-form').addEventListener('submit', e => {
  e.preventDefault();
  const name = document.getElementById('name').value;
  const id = document.getElementById('idNumber').value;
  const phone = document.getElementById('phone').value;
  const residence = document.getElementById('residence').value;
  workers.push({ name, idNumber: id, phone, residence, attendance: [] });
  saveWorkers();
  e.target.reset();
  renderWorkers();
  alert('Worker added!');
});

document.getElementById('attendance-form').addEventListener('submit', e => {
  e.preventDefault();
  const index = document.getElementById('select-worker').value;
  const date = document.getElementById('attDate').value;
  const pay = parseFloat(document.getElementById('attPay').value);
  if (!date) return alert("Select a date");
  workers[index].attendance.push({ date, ...(isNaN(pay) ? {} : { pay }) });
  saveWorkers();
  e.target.reset();
  alert("Attendance added");
  renderDashboard();
});

// Init dashboard
navigate('dashboard');
