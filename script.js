let workers = JSON.parse(localStorage.getItem('workersData')) || [];

function saveWorkers() {
  localStorage.setItem('workersData', JSON.stringify(workers));
}

function renderWorkers(data) {
  const tableBody = document.getElementById("workersTableBody");
  tableBody.innerHTML = "";
  data.forEach(worker => {
    const row = document.createElement("tr");
    row.innerHTML = `<td>${worker.name}</td><td>${worker.id}</td><td>${worker.residence}</td><td>${worker.phone}</td>`;
    tableBody.appendChild(row);
  });
  document.getElementById("totalWorkers").textContent = data.length;
}

document.getElementById("searchInput").addEventListener("input", function () {
  const keyword = this.value.toLowerCase();
  const filtered = workers.filter(w => w.name.toLowerCase().includes(keyword));
  renderWorkers(filtered);
});

document.getElementById("addWorkerBtn").addEventListener("click", () => {
  document.getElementById("modal").style.display = "flex";
});

document.getElementById("cancelModal").addEventListener("click", () => {
  document.getElementById("modal").style.display = "none";
});

document.getElementById("workerForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("workerName").value;
  const id = document.getElementById("workerID").value;
  const residence = document.getElementById("workerResidence").value;
  const phone = document.getElementById("workerPhone").value;

  if (!name || !id || !residence || !phone) {
    alert("Please fill in all fields");
    return;
  }

  workers.push({ name, id, residence, phone });
  saveWorkers();
  renderWorkers(workers);
  e.target.reset();
  document.getElementById("modal").style.display = "none";
});

// Initial render
renderWorkers(workers);
