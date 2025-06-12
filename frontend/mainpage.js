const modal = document.getElementById('sqlModal');
const form = document.getElementById('sqlForm');
const fieldsContainer = document.getElementById('modalFields');
const title = document.getElementById('modalTitle');
const cancelBtn = document.getElementById('cancelModalBtn');

const showModal = (operation) => {
    modal.classList.remove('hidden');
    form.reset();
    fieldsContainer.innerHTML = '';
    title.textContent = `${operation} Operation`;

    if (operation === 'Create') {
        fieldsContainer.innerHTML = `
            <label>Table Name:</label>
            <input type="text" name="tableName" required>
            <label>Number of Columns:</label>
            <input type="number" name="columnCount" min="1" required>
            <div id="extraFields"></div>
        `;

        form.columnCount?.addEventListener('input', () => {
            const count = parseInt(form.columnCount.value);
            const extra = document.getElementById('extraFields');
            extra.innerHTML = '';
            for (let i = 0; i < count; i++) {
                extra.innerHTML += `
                    <label>Column ${i + 1} Name:</label>
                    <input type="text" name="colName${i}" required>
                    <label>Column ${i + 1} Type:</label>
                    <input type="text" name="colType${i}" required>
                `;
            }
        });
    }

    else if (operation === 'Insert') {
        fieldsContainer.innerHTML = `
            <label>Table Name:</label>
            <input type="text" name="tableName" required>
            <label>Column Names (comma-separated):</label>
            <input type="text" name="columns" placeholder="e.g. id,name,age" required>
            <label>Values (comma-separated):</label>
            <input type="text" name="values" placeholder="e.g. 1,'Alice',22" required>
        `;
    }

    else if (operation === 'Select') {
        fieldsContainer.innerHTML = `
            <label>Table Name:</label>
            <input type="text" name="tableName" required>
            <label>Where Clause (optional):</label>
            <input type="text" name="where" placeholder="e.g. id = 1">
        `;
    }

    else if (operation === 'Update') {
        fieldsContainer.innerHTML = `
            <label>Table Name:</label>
            <input type="text" name="tableName" required>
            <label>SET Clause:</label>
            <input type="text" name="set" placeholder="e.g. name='Bob'" required>
            <label>WHERE Clause:</label>
            <input type="text" name="where" placeholder="e.g. id=1" required>
        `;
    }

    else if (operation === 'Delete') {
        fieldsContainer.innerHTML = `
            <label>Table Name:</label>
            <input type="text" name="tableName" required>
            <label>WHERE Clause:</label>
            <input type="text" name="where" placeholder="e.g. id=2" required>
        `;
    }

    else if (operation === 'Drop') {
        fieldsContainer.innerHTML = `
            <label>Table Name to Drop:</label>
            <input type="text" name="tableName" required>
        `;
    }

    else if (operation === 'Alter') {
        fieldsContainer.innerHTML = `
            <label>Table Name:</label>
            <input type="text" name="tableName" required>
            <label>ALTER Command:</label>
            <input type="text" name="command" placeholder="e.g. ADD COLUMN age INTEGER" required>
        `;
    }
};

cancelBtn.addEventListener('click', () => {
    modal.classList.add('hidden');
});

document.querySelectorAll('.action-btn').forEach(button => {
    button.addEventListener('click', () => {
        const op = button.textContent.trim();
        showModal(op);
    });
});

form.addEventListener('submit', (e) => {
    e.preventDefault();

    const op = title.textContent.split(' ')[0]; 
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    if (op === 'Create') {
        const colCount = parseInt(data.columnCount);
        const columns = [];
        for (let i = 0; i < colCount; i++) {
            columns.push({
                name: form[`colName${i}`].value,
                type: form[`colType${i}`].value
            });
        }

        fetch('/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                tableName: data.tableName,
                columns: columns
            })
        })
        .then(res => res.json())
        .then(res => {
            alert(res.message || 'Table created!');
            modal.classList.add('hidden');
        })
        .catch(err => {
            console.error(err);
            alert('Error creating table');
        });

        return;
    }

    const endpointMap = {
        'Insert': '/insert',
        'Select': '/select',
        'Update': '/update',
        'Delete': '/delete',
        'Drop': '/drop',
        'Alter': '/alter'
    };

    const endpoint = endpointMap[op];

    if (!endpoint) {
        alert('Unknown operation: ' + op);
        return;
    }

    let payload = {};

    switch (op) {
        case 'Insert':
            payload = {
                tableName: data.tableName,
                columns: data.columns,
                values: data.values
            };
            break;
        case 'Select':
            payload = {
                tableName: data.tableName,
                where: data.where || ''
            };
            break;
        case 'Update':
            payload = {
                tableName: data.tableName,
                set: data.set,
                where: data.where
            };
            break;
        case 'Delete':
            payload = {
                tableName: data.tableName,
                where: data.where
            };
            break;
        case 'Drop':
            payload = {
                tableName: data.tableName
            };
            break;
        case 'Alter':
            payload = {
                tableName: data.tableName,
                command: data.command
            };
            break;
        default:
            console.warn('Unhandled operation');
            return;
    }

    fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    .then(res => {
        if (!res.ok) throw new Error('Server error');
        return res.json();
    })
    .then(res => {
        if (Array.isArray(res)) {
            alert('Result: ' + JSON.stringify(res, null, 2)); 
        } else {
            alert(res.message || res.error || 'Done');
        }
        modal.classList.add('hidden');
    })
    .catch(err => {
        console.error(err);
        alert('Error: ' + err.message);
    });
});
async function loadUsers() {
    const container = document.getElementById('table-container');
    container.style.display = 'block';
    container.innerHTML = 'Loading...';
  
    try {
      const res = await fetch('http://localhost:3000/students');
      
  
      // Debug log
      console.log("Response status:", res.status);
  
      if (!res.ok) throw new Error("Failed to fetch");
  
      const data = await res.json();
  
      console.log("Data received:", data);
  
      if (!Array.isArray(data) || data.length === 0) {
        container.innerHTML = 'No data found.';
        return;
      }
  
      const columns = Object.keys(data[0]);
  
      const table = document.createElement('table');
      const thead = table.createTHead();
      const headRow = thead.insertRow();
  
      columns.forEach(col => {
        const th = document.createElement('th');
        th.textContent = col;
        headRow.appendChild(th);
      });
  
      const tbody = document.createElement('tbody');
      

      data.forEach(rowObj => {
        const tr = document.createElement('tr');
        columns.forEach(col => {
          const td = document.createElement('td');
          let cellData = rowObj[col];
  
          if (typeof cellData === 'object' && cellData !== null) {
            cellData = JSON.stringify(cellData);
          }
  
          td.textContent = cellData;
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
      });
  
      table.appendChild(tbody);
      container.innerHTML = '';
      container.appendChild(table);
  
    } catch (err) {
      container.innerHTML = '❌ Error loading data';
      console.error("Fetch failed:", err);
    }
  }
  

  document.addEventListener('DOMContentLoaded', () => {
    const selectBtn = document.querySelector('.btn-select');
    if (selectBtn) {
      selectBtn.addEventListener('click', () => {
        loadUsers(); // <-- Your function
      });
    }
  });
  
  
  
  