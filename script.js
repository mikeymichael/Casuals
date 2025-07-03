// ---------- Data ----------

let workers = JSON.parse(localStorage.getItem('workersData')) || [{
  name: 'John Doe',
  idNumber: '001',
  phone: '0712345678',
  residence: 'Nairobi',
  dailyRate: 500,
  attendance: [
    { date: '2025-07-01', pay: 500, hours: 8, notes: 'On time' },
    { date: '2025-07-02', pay: 600, hours: 9 },
    { date: '2025-07-03' }
  ],
  notes: '',
  photo: ''
}];

saveWorkers();

// ---------- Navigation ----------

document.querySelectorAll('.sidebar ul li').forEach(li => {
  li.addEventListener('click', () => {
    navigate(li.dataset.page);
  });
});

function navigate(id) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  const section = document.getElementById(id);
  if (section) {
    section.classList.add('active');
    if (id === 'dashboard') renderDashboard();
    if (id === 'workers') renderWorkers();
    if (id === 'attendance') renderAttendance();
    if (id === 'timecards') renderTimeCards();
    if (id === 'financial') renderFinancial();
    if (id === 'personal') renderPersonal();
    if (id === 'payroll') renderPayroll();
  }
}

// ---------- Dark Mode ----------

document.getElementById('darkModeToggle').addEventListener('click', () => {
  document.body.classList.toggle('dark');
});

// ---------- Dashboard ----------

function renderDashboard() {
  let totalWorkers = workers.length;
  let monthTotal = 0;
  let residenceCounts = {};
  let topWorker = '-';
  let maxPay = 0;

  const now = new Date();
  const month = now.getMonth();

  workers.forEach(w => {
    let monthlyPay = 0;
    (w.attendance || []).forEach(a => {
      if (a.date && new Date(a.date).getMonth() === month) {
        monthlyPay += a.pay || 0;
      }
    });
    if (monthlyPay > maxPay) {
      maxPay = monthlyPay;
      topWorker = w.name;
    }
    monthTotal += monthlyPay;

    residenceCounts[w.residence] = (residenceCounts[w.residence] || 0) + 1;
  });

  document.getElementById('dash-cards').innerHTML = `
    <div class="card"><h3>Total Workers</h3><p>${totalWorkers}</p></div>
    <div class="card"><h3>Monthly Pay</h3><p>KSH ${monthTotal}</p></div>
    <div class="card"><h3>Top Earner</h3><p>${topWorker} (${maxPay})</p></div>
  `;

  renderResidenceChart(residenceCounts);
  renderPayChart();
}

function renderResidenceChart(counts) {
  const ctx = document.getElementById('residenceChart').getContext('2d');
  const labels = Object.keys(counts);
  const data = Object.values(counts);

  if (window.residenceChartInstance) {
    window.residenceChartInstance.destroy();
  }

  window.residenceChartInstance = new Chart(ctx, {
    type: 'pie',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: ['#3f8efc', '#0a74da', '#095ab5', '#ff9800', '#4caf50']
      }]
    }
  });
}

function renderPayChart() {
  const ctx = document.getElementById('payChart').getContext('2d');
  const dates = [...new Set(
    workers.flatMap(w => w.attendance.map(a => a.date))
  )].filter(Boolean).sort();

  const totals = dates.map(date => {
    return workers.reduce((sum, w) => {
      return sum + (w.attendance || []).filter(a => a.date === date)
        .reduce((s, a) => s + (a.pay || 0), 0);
    }, 0);
  });

  if (window.payChartInstance) {
    window.payChartInstance.destroy();
  }

  window.payChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: dates,
      datasets: [{
        label: 'Total Pay (KSH)',
        data: totals,
        backgroundColor: '#3f8efc'
      }]
    },
    options: {
      responsive: true,
      scales: { y: { beginAtZero: true } }
    }
  });
}

// ---------- Workers ----------

function renderWorkers() {
  const tbody = document.querySelector('#workers-table tbody');
  const searchVal = document.getElementById('worker-search').value?.toLowerCase() || '';

  const filtered = workers.filter(w =>
    w.name.toLowerCase().includes(searchVal) ||
    w.idNumber.toLowerCase().includes(searchVal) ||
    w.residence.toLowerCase().includes(searchVal)
  );

  tbody.innerHTML = filtered.map((w, i) => `
    <tr>
      <td>${w.name}</td>
      <td>${w.idNumber}</td>
      <td>${w.phone}</td>
      <td>${w.residence}</td>
      <td>${w.dailyRate}</td>
      <td>
        <button onclick="showProfile(${i})"><i class="fas fa-eye"></i> Profile</button>
        <button onclick="deleteWorker(${i})"><i class="fas fa-trash"></i> Delete</button>
      </td>
    </tr>
  `).join('');
}

document.getElementById('worker-form').addEventListener('submit', e => {
  e.preventDefault();
  const name = document.getElementById('name').value;
  const id = document.getElementById('idNumber').value;
  const phone = document.getElementById('phone').value;
  const residence = document.getElementById('residence').value;
  const dailyRate = parseFloat(document.getElementById('dailyRate').value);
  workers.push({ name, idNumber: id, phone, residence, dailyRate, attendance: [], notes: '' });
  saveWorkers();
  e.target.reset();
  renderWorkers();
  showToast('Worker added!');
});

document.getElementById('worker-search').addEventListener('input', renderWorkers);

document.getElementById('exportWorkers').addEventListener('click', () => {
  const rows = [['Name', 'ID', 'Phone', 'Residence', 'Daily Rate']];
  workers.forEach(w => rows.push([w.name, w.idNumber, w.phone, w.residence, w.dailyRate]));
  downloadCSV(rows, 'workers.csv');
});

function deleteWorker(i) {
  if (confirm("Delete this worker?")) {
    workers.splice(i, 1);
    saveWorkers();
    renderWorkers();
    renderDashboard();
    showToast('Worker deleted!');
  }
}

function showProfile(i) {
  const w = workers[i];
  const attendance = (w.attendance || []).map(a => `
    <tr>
      <td>${a.date}</td>
      <td>${a.hours || '-'}</td>
      <td>${a.pay || '-'}</td>
      <td>${a.notes || ''}</td>
    </tr>
  `).join('');

  document.getElementById('profile-content').innerHTML = `
    <h3>${w.name}</h3>
    <p><strong>ID:</strong> ${w.idNumber}</p>
    <p><strong>Phone:</strong> ${w.phone}</p>
    <p><strong>Residence:</strong> ${w.residence}</p>
    <p><strong>Daily Rate:</strong> ${w.dailyRate}</p>
    <textarea id="worker-notes" placeholder="Add notes...">${w.notes || ''}</textarea>
    <button onclick="saveWorkerNotes(${i})">Save Notes</button>
    <h4>Attendance</h4>
    <table>
      <thead><tr><th>Date</th><th>Hours</th><th>Pay</th><th>Notes</th></tr></thead>
      <tbody>${attendance}</tbody>
    </table>
  `;
  navigate('profile');
}

function saveWorkerNotes(i) {
  const notes = document.getElementById('worker-notes').value;
  workers[i].notes = notes;
  saveWorkers();
  showToast('Notes saved!');
}

// ---------- Attendance ----------

function renderAttendance() {
  renderAttendanceOptions();
  renderCalendar();
}

function renderAttendanceOptions() {
  const select = document.getElementById('select-worker');
  select.innerHTML = workers.map((w, i) =>
    `<option value="${i}">${w.name} (${w.idNumber})</option>`
  ).join('');
}

document.getElementById('attendance-form').addEventListener('submit', e => {
  e.preventDefault();
  const index = document.getElementById('select-worker').value;
  const date = document.getElementById('attDate').value;
  const hours = parseFloat(document.getElementById('attHours').value);
  const pay = parseFloat(document.getElementById('attPay').value);
  const notes = document.getElementById('attNotes').value;

  let calculatedPay = isNaN(pay)
    ? (workers[index].dailyRate * (isNaN(hours) ? 1 : (hours / 8)))
    : pay;

  workers[index].attendance.push({
    date,
    pay: calculatedPay,
    hours: isNaN(hours) ? null : hours,
    notes
  });

  saveWorkers();
  renderCalendar();
  e.target.reset();
  showToast('Attendance added!');
});

document.getElementById('exportAttendance').addEventListener('click', () => {
  const rows = [['Name','Date','Hours','Pay','Notes']];
  workers.forEach(w => {
    (w.attendance || []).forEach(a => {
      rows.push([
        w.name,
        a.date || '',
        a.hours || '',
        a.pay || '',
        a.notes || ''
      ]);
    });
  });
  downloadCSV(rows, 'attendance.csv');
});

function renderCalendar() {
  const events = workers.flatMap(w =>
    (w.attendance || []).map(a => ({
      title: `${w.name}: KSH ${a.pay}`,
      date: a.date,
      backgroundColor: a.pay ? '#3f8efc' : '#f44336'
    }))
  );

  const calendarEl = document.getElementById('calendar');
  calendarEl.innerHTML = '';

  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    events
  });
  calendar.render();
}

// ---------- Other Pages ----------

function renderTimeCards() {
  document.getElementById('timecards-content').innerHTML = `
    <div class="card"><h3>Total Time Cards</h3><p>${workers.length * 5} entries</p></div>
  `;
}

function renderFinancial() {
  document.getElementById('financial-content').innerHTML = `
    <div class="card"><h3>Total Bonuses Paid</h3><p>KSH 20,000</p></div>
  `;
}

function renderPersonal() {
  document.getElementById('personal-content').innerHTML = `
    <table>
      <thead><tr><th>Name</th><th>ID</th><th>Email</th><th>Address</th></tr></thead>
      <tbody>
        ${workers.map(w => `
          <tr>
            <td>${w.name}</td>
            <td>${w.idNumber}</td>
            <td>${w.name.toLowerCase().replace(' ', '.')}@example.com</td>
            <td>${w.residence}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function renderPayroll() {
  document.getElementById('download-payroll').onclick = () => {
    const rows = [['Name', 'ID', 'Total Pay']];
    workers.forEach(w => {
      const totalPay = w.attendance.reduce((sum, a) => sum + (a.pay || 0), 0);
      rows.push([w.name, w.idNumber, totalPay]);
    });
    downloadCSV(rows, 'payroll.csv');
  };
}

// ---------- Utilities ----------

function saveWorkers() {
  localStorage.setItem('workersData', JSON.stringify(workers));
}

function downloadCSV(rows, filename) {
  const csv = rows.map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// ---------- Init ----------

navigate('dashboard');
