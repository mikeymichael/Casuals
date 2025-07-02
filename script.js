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
