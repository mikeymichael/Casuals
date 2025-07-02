const workdaysTable = document.getElementById('workdaysTable');
const totalDaysDisplay = document.getElementById('totalDaysWorked');

// Demo workers list (would be dynamic in real app)
const workers = [
  { name: 'John Doe', id: '123' },
  { name: 'Jane Smith', id: '456' },
  { name: 'Ali Mwangi', id: '789' },
];

const weekdays = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
let workdays = JSON.parse(localStorage.getItem('workdays')) || {};

function renderWorkdays() {
  workdaysTable.innerHTML = '';
  let total = 0;

  workers.forEach(w => {
    if (!workdays[w.id]) workdays[w.id] = Array(7).fill(false);

    const row = document.createElement('tr');
    row.innerHTML = `<td>${w.name}</td><td>${w.id}</td>`;

    workdays[w.id].forEach((worked, i) => {
      const cell = document.createElement('td');
      const dot = document.createElement('span');
      dot.className = 'workday-cell' + (worked ? ' worked' : '');
      dot.title = weekdays[i];
      dot.addEventListener('click', () => {
        workdays[w.id][i] = !workdays[w.id][i];
        saveWorkdays();
        renderWorkdays();
      });
      cell.appendChild(dot);
      row.appendChild(cell);
      if (worked) total++;
    });

    workdaysTable.appendChild(row);
  });

  totalDaysDisplay.textContent = total;
}

function saveWorkdays() {
  localStorage.setItem('workdays', JSON.stringify(workdays));
}

renderWorkdays();

const openBtn = document.getElementById('openForm');
const closeBtn = document.getElementById('closeForm');
const modal = document.getElementById('workerModal');
const form = document.getElementById('workerForm');
const table = document.getElementById('workerTable');
const search = document.getElementById('searchInput');
const countDisplay = document.getElementById('workerCount');

let workers = JSON.parse(localStorage.getItem('workers')) || [];
let workdays = JSON.parse(localStorage.getItem('workdays')) || {};

function saveAndRender() {
  localStorage.setItem('workers', JSON.stringify(workers));
  renderTable(workers);
  countDisplay.textContent = workers.length;
}
function renderTable(data) {
  table.innerHTML = "";
  data.forEach(w => {
    const row = document.createElement('tr');
    row.innerHTML = `<td>${w.name}</td><td>${w.id}</td><td>${w.residence}</td><td>${w.phone}</td><td><button onclick="viewWorker('${w.id}')">View</button></td>`;
    table.appendChild(row);
  });
}

openBtn.onclick = () => modal.style.display = "flex";
closeBtn.onclick = () => modal.style.display = "none";

form.onsubmit = function(e) {
  e.preventDefault();
  const name = document.getElementById('name').value;
  const id = document.getElementById('id').value;
  const residence = document.getElementById('residence').value;
  const phone = document.getElementById('phone').value;
  workers.push({ name, id, residence, phone });
  form.reset();
  modal.style.display = "none";
  saveAndRender();
};

search.oninput = function() {
  const term = this.value.toLowerCase();
  const filtered = workers.filter(w => w.name.toLowerCase().includes(term));
  renderTable(filtered);
};

document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', function(e) {
    e.preventDefault();
    const page = this.dataset.page;
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    this.classList.add('active');
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(page + "Page").classList.add('active');
    if (page === "workdays") renderWorkdays();
    if (page === "report") renderPayroll();
  });
});

function viewWorker(id) {
  const w = workers.find(x => x.id === id);
  const days = workdays[id] || Array(7).fill(false);
  const totalDays = days.filter(Boolean).length;
  const pay = totalDays * 500; // fixed rate
  alert(`${w.name}
Total Days Worked: ${totalDays}
Total Pay: KES ${pay}`);
}

function renderPayroll() {
  const tbody = document.getElementById('payrollTable');
  tbody.innerHTML = '';
  workers.forEach(w => {
    const days = workdays[w.id] || Array(7).fill(false);
    const worked = days.filter(Boolean).length;
    const pay = worked * 500;
    const row = document.createElement('tr');
    row.innerHTML = `<td>${w.name}</td><td>${w.id}</td><td>${worked}</td><td>KES ${pay}</td>`;
    tbody.appendChild(row);
  });
}

saveAndRender();
