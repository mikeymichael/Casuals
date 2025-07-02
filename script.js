const workers = [
  { name: "John Doe", id: "12545678", residence: "Nairobi", sha: "100200300" },
  { name: "Jane Smith", id: "87654321", residence: "Mombasa", sha: "300480500" },
  { name: "Michael Johnson", id: "13579246", residence: "Kisumu", sha: "600700800" },
  { name: "Mary Otieno", id: "56473929", residence: "Nakuru", sha: "900100200" }
];

const totalPay = 1250000;

document.getElementById("totalWorkers").textContent = workers.length;
document.getElementById("totalPay").textContent = "KSH " + totalPay.toLocaleString();

const tableBody = document.getElementById("workersTableBody");
function renderWorkers(data) {
  tableBody.innerHTML = "";
  data.forEach(worker => {
    const row = document.createElement("tr");
    row.innerHTML = \`<td>\${worker.name}</td><td>\${worker.id}</td><td>\${worker.residence}</td><td>\${worker.sha}</td>\`;
    tableBody.appendChild(row);
  });
}
renderWorkers(workers);

document.getElementById("searchInput").addEventListener("input", function () {
  const keyword = this.value.toLowerCase();
  const filtered = workers.filter(w => w.name.toLowerCase().includes(keyword));
  renderWorkers(filtered);
});
