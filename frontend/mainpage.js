const modal = document.getElementById('sqlModal');
const form = document.getElementById('sqlForm');
const fieldsContainer = document.getElementById('modalFields');
const title = document.getElementById('modalTitle');
const cancelBtn = document.getElementById('cancelModalBtn');

let currentTableName = 'students'; // Default table to show

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
    } else if (operation === 'Insert') {
        fieldsContainer.innerHTML = `
            <label>Table Name:</label>
            <input type="text" name="tableName" value="${currentTableName}" required>
            <label>Column Names (comma-separated):</label>
            <input type="text" name="columns" placeholder="e.g. id,name,age" required>
            <label>Values (comma-separated):</label>
            <input type="text" name="values" placeholder="e.g. 1,'Alice',22" required>
        `;
    } else if (operation === 'Select') {
        fieldsContainer.innerHTML = `
            <label>Table Name:</label>
            <input type="text" name="tableName" value="${currentTableName}" required>
            <label>Where Clause (optional):</label>
            <input type="text" name="where" placeholder="e.g. id = 1">
        `;
    } else if (operation === 'Update') {
        fieldsContainer.innerHTML = `
            <label>Table Name:</label>
            <input type="text" name="tableName" value="${currentTableName}" required>
            <label>SET Clause:</label>
            <input type="text" name="set" placeholder="e.g. name='Bob'" required>
            <label>WHERE Clause:</label>
            <input type="text" name="where" placeholder="e.g. id=1" required>
        `;
    } else if (operation === 'Delete') {
        fieldsContainer.innerHTML = `
            <label>Table Name:</label>
            <input type="text" name="tableName" value="${currentTableName}" required>
            <label>WHERE Clause:</label>
            <input type="text" name="where" placeholder="e.g. id=2" required>
        `;
    } else if (operation === 'Drop') {
        fieldsContainer.innerHTML = `
            <label>Table Name to Drop:</label>
            <input type="text" name="tableName" value="${currentTableName}" required>
        `;
    } else if (operation === 'Alter') {
        fieldsContainer.innerHTML = `
            <label>Table Name:</label>
            <input type="text" name="tableName" value="${currentTableName}" required>
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
            // Update current table and reload data
            currentTableName = data.tableName;
            loadTableData(currentTableName);
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
            displayTableData(res, data.tableName);
            currentTableName = data.tableName;
        } else {
            alert(res.message || res.error || 'Done');
            // Reload current table data after operations
            loadTableData(currentTableName);
        }
        modal.classList.add('hidden');
    })
    .catch(err => {
        console.error(err);
        alert('Error: ' + err.message);
    });
});

// Function to load table data
async function loadTableData(tableName) {
    const container = document.getElementById('table-container');
    container.style.display = 'block';
    container.innerHTML = 'Loading...';

    try {
        const res = await fetch('/select', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tableName: tableName })
        });

        console.log("Response status:", res.status);

        if (!res.ok) throw new Error("Failed to fetch");

        const data = await res.json();
        console.log("Data received:", data);

        displayTableData(data, tableName);

    } catch (err) {
        container.innerHTML = '❌ Error loading data';
        console.error("Fetch failed:", err);
    }
}

// Function to display table data
function displayTableData(data, tableName) {
    const container = document.getElementById('table-container');
    
    if (!Array.isArray(data) || data.length === 0) {
        container.innerHTML = `<div style="color: beige; text-align: center; padding: 20px;">
            <h4>Table: ${tableName}</h4>
            <p>No data found in this table.</p>
        </div>`;
        return;
    }

    const columns = Object.keys(data[0]);

    const tableHtml = `
        <div style="color: beige; margin-bottom: 10px;">
            <h4>Table: ${tableName}</h4>
            <button onclick="exportTableToCSV('${tableName}')" style="background: #4CAF50; color: white; padding: 5px 10px; border: none; border-radius: 3px; cursor: pointer;">
                Export to CSV
            </button>
        </div>
        <table>
            <thead>
                <tr>
                    ${columns.map(col => `<th>${col}</th>`).join('')}
                </tr>
            </thead>
            <tbody>
                ${data.map(rowObj => `
                    <tr>
                        ${columns.map(col => {
                            let cellData = rowObj[col];
                            if (typeof cellData === 'object' && cellData !== null) {
                                cellData = JSON.stringify(cellData);
                            }
                            return `<td>${cellData}</td>`;
                        }).join('')}
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    container.innerHTML = tableHtml;
}

// Export function
async function exportTableToCSV(tableName) {
    try {
        const res = await fetch('/select', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tableName: tableName })
        });

        if (!res.ok) throw new Error("Failed to fetch data for export");

        const data = await res.json();

        if (!Array.isArray(data) || data.length === 0) {
            alert('No data to export');
            return;
        }

        // Convert to CSV
        const columns = Object.keys(data[0]);
        const csvContent = [
            columns.join(','), // Header row
            ...data.map(row => 
                columns.map(col => {
                    let value = row[col];
                    if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
                        value = `"${value.replace(/"/g, '""')}"`;
                    }
                    return value;
                }).join(',')
            )
        ].join('\n');

        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${tableName}_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        alert(`Table "${tableName}" exported successfully!`);
    } catch (err) {
        console.error('Export failed:', err);
        alert('Error exporting table: ' + err.message);
    }
}

// Import function
function importCSV() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        try {
            const text = await file.text();
            const lines = text.split('\n').filter(line => line.trim());
            
            if (lines.length < 2) {
                alert('CSV file must have at least a header and one data row');
                return;
            }

            const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
            const tableName = file.name.replace('.csv', '').replace(/[^a-zA-Z0-9_]/g, '_');

            // Create table first
            const columns = headers.map(header => ({
                name: header,
                type: 'TEXT' // Default to TEXT type
            }));

            const createRes = await fetch('/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tableName: tableName,
                    columns: columns
                })
            });

            if (!createRes.ok) {
                const error = await createRes.json();
                throw new Error(error.error || 'Failed to create table');
            }

            // Insert data
            for (let i = 1; i < lines.length; i++) {
                const values = lines[i].split(',').map(v => v.trim());
                if (values.length !== headers.length) continue;

                const formattedValues = values.map(v => {
                    // Remove quotes and escape single quotes
                    v = v.replace(/^"(.*)"$/, '$1').replace(/'/g, "''");
                    return `'${v}'`;
                }).join(',');

                await fetch('/insert', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        tableName: tableName,
                        columns: headers.join(','),
                        values: formattedValues
                    })
                });
            }

            currentTableName = tableName;
            loadTableData(tableName);
            alert(`CSV imported successfully as table "${tableName}"!`);

        } catch (err) {
            console.error('Import failed:', err);
            alert('Error importing CSV: ' + err.message);
        }
    };
    input.click();
}

// Load default table on page load
document.addEventListener('DOMContentLoaded', () => {
    loadTableData(currentTableName);

    // Add event listeners for export and import buttons
    const exportBtn = document.querySelector('.export-btn-main');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            if (currentTableName) {
                exportTableToCSV(currentTableName);
            } else {
                alert('No table selected for export');
            }
        });
    }

    // Add import functionality
    const importBtn = document.querySelector('.import-btn-main');
    if (importBtn) {
        importBtn.addEventListener('click', importCSV);
    }
});