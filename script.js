let workers = JSON.parse(localStorage.getItem('workersData')) || [{
  name: 'John Doe', idNumber: '001', phone: '0712345678', residence: 'Nairobi',
  attendance: [
    { date: '2025-07-01', pay: 500 },
    { date: '2025-07-02', pay: 600 },
    { date: '2025-07-03' }
  ]
}];

function showSection(id) {
  const section = document.getElementById(id);
  if (!section) return console.warn(`Section ${id} not found.`);
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  section.classList.add('active');
  if (id === 'dashboard') renderDashboard();
  if (id === 'workers') renderWorkers();
}

function renderDashboard() {
  const now = new Date();
  const month = now.getMonth();
  const thisWeek = [...Array(7)].map((_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  });

  let total = 0, monthTotal = 0, unpaid = 0;
  let reportRows = '';
  workers.forEach(w => {
    let weekPay = 0, monthPay = 0, missed = 0;
    (w.attendance || []).forEach(a => {
      if (thisWeek.includes(a.date)) weekPay += a.pay || 0;
      if (!a.pay) missed++;
      if (new Date(a.date).getMonth() === month) monthPay += a.pay || 0;
    });
    total += weekPay;
    monthTotal += monthPay;
    unpaid += missed;
    reportRows += `<tr><td>${w.name}</td><td>${w.idNumber}</td><td>${weekPay}</td><td>${missed}</td><td>${monthPay}</td></tr>`;
  });

  document.getElementById('total-workers').innerText = workers.length;
  document.getElementById('total-pay').innerText = total;
  document.getElementById('month-pay').innerText = monthTotal;
  document.getElementById('unpaid-count').innerText = unpaid;
  document.getElementById('avg-pay').innerText = workers.length ? Math.round(total / workers.length) : 0;
  document.querySelector('#report-table tbody').innerHTML = reportRows;
}

function renderWorkers() {
  const rows = workers.map(w => `<tr><td>${w.name}</td><td>${w.idNumber}</td><td>${w.phone}</td><td>${w.residence}</td></tr>`);
  document.querySelector('#workers-table tbody').innerHTML = rows.join('');
}

function exportReport() {
  const rows = [['Name','ID','Weekly Paid','Unpaid Days','Monthly Paid']];
  document.querySelectorAll('#report-table tbody tr').forEach(tr => {
    rows.push([...tr.children].map(td => td.innerText));
  });
  const csv = rows.map(r => r.join(',')).join('\\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'worker_report.csv';
  a.click();
}

document.getElementById('worker-form').addEventListener('submit', e => {
  e.preventDefault();
  const name = document.getElementById('name').value;
  const id = document.getElementById('idNumber').value;
  const phone = document.getElementById('phone').value;
  const residence = document.getElementById('residence').value;
  workers.push({ name, idNumber: id, phone, residence, attendance: [] });
  localStorage.setItem('workersData', JSON.stringify(workers));
  e.target.reset();
  renderWorkers();
  alert('Worker added!');
});

// Initial render
showSection('dashboard');
