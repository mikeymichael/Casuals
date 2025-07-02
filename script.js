
const workers = JSON.parse(localStorage.getItem('workersData')) || [];

function showSection(id) {
  if (!document.getElementById(id)) return;
  document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  if (id === 'dashboard') renderReport();
}

function renderReport() {
  document.getElementById('total-workers').innerText = workers.length;
  let totalPay = 0;
  const tbody = document.querySelector('#report-table tbody');
  tbody.innerHTML = '';
  const now = new Date();
  const month = now.getMonth();
  workers.forEach(w => {
    let weekly = 0, unpaid = 0, monthly = 0;
    (w.attendance || []).forEach(a => {
      const date = new Date(a.date);
      if (a.pay) {
        weekly += a.pay;
        if (date.getMonth() === month) monthly += a.pay;
      } else {
        unpaid++;
      }
    });
    totalPay += weekly;
    tbody.innerHTML += `<tr>
      <td>${w.name}</td>
      <td>${w.idNumber}</td>
      <td>${weekly}</td>
      <td>${unpaid}</td>
      <td>${monthly}</td>
    </tr>`;
  });
  document.getElementById('total-pay').innerText = totalPay.toFixed(2);
}

function exportReport() {
  const rows = [["Name", "ID", "Total Paid", "Total Unpaid", "Paid This Month"]];
  document.querySelectorAll('#report-table tbody tr').forEach(tr => {
    const cols = Array.from(tr.children).map(td => td.innerText);
    rows.push(cols);
  });
  const csv = rows.map(r => r.join(',')).join('\n');
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
  const idNumber = document.getElementById('idNumber').value;
  const residence = document.getElementById('residence').value;
  const shaAccount = document.getElementById('shaAccount').value;
  workers.push({ name, idNumber, residence, shaAccount, attendance: [] });
  localStorage.setItem('workersData', JSON.stringify(workers));
  e.target.reset();
  alert('Worker added');
});
