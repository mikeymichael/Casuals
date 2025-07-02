const openBtn = document.getElementById('openForm');
const closeBtn = document.getElementById('closeForm');
const modal = document.getElementById('workerModal');
const form = document.getElementById('workerForm');
const table = document.getElementById('workerTable');
const search = document.getElementById('searchInput');
const countDisplay = document.getElementById('workerCount');

let workers = JSON.parse(localStorage.getItem('workers')) || [];

function saveAndRender() {
  localStorage.setItem('workers', JSON.stringify(workers));
  renderTable(workers);
  countDisplay.textContent = workers.length;
}

function renderTable(data) {
  table.innerHTML = "";
  data.forEach(w => {
    const row = document.createElement('tr');
    row.innerHTML = `<td>${w.name}</td><td>${w.id}</td><td>${w.residence}</td><td>${w.phone}</td>`;
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

saveAndRender();
