const modal = document.getElementById('sqlModal');
const form = document.getElementById('sqlForm');
const fieldsContainer = document.getElementById('modalFields');
const title = document.getElementById('modalTitle');
const cancelBtn = document.getElementById('cancelModalBtn');

let currentTableName = 'students'; // Default table to show

// Function to display SQL command - IMPROVED VERSION
function displaySQLCommand(command) {
    console.log('Attempting to display SQL command:', command);
    
    const sqlDisplay = document.getElementById('sql-command-display');
    if (sqlDisplay) {
        sqlDisplay.textContent = command;
        console.log('SQL command displayed successfully:', command);
        
        // Add a visual feedback effect
        sqlDisplay.style.backgroundColor = '#2a2a2a';
        sqlDisplay.style.transition = 'background-color 0.3s ease';
        setTimeout(() => {
            sqlDisplay.style.backgroundColor = '#181818';
        }, 300);
        
    } else {
        console.error('SQL display element not found! Creating fallback...');
        
        // Create the element if it doesn't exist (fallback)
        const container = document.getElementById('table-container');
        if (container && container.parentNode) {
            const sqlContainer = document.createElement('div');
            sqlContainer.innerHTML = `
                <div id="sql-command-box" class="sql-command-container">
                    <h4>Last Executed SQL Command:</h4>
                    <div id="sql-command-display" class="sql-command-text">${command}</div>
                </div>
            `;
            container.parentNode.insertBefore(sqlContainer, container.nextSibling);
            console.log('Created SQL command element as fallback');
        }
    }
}

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

        const columnCountInput = form.querySelector('input[name="columnCount"]');
        if (columnCountInput) {
            columnCountInput.addEventListener('input', () => {
                const count = parseInt(columnCountInput.value);
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

    // Handle CREATE operation specially
    if (op === 'Create') {
        const colCount = parseInt(data.columnCount);
        const columns = [];
        for (let i = 0; i < colCount; i++) {
            const colNameInput = form.querySelector(`input[name="colName${i}"]`);
            const colTypeInput = form.querySelector(`input[name="colType${i}"]`);
            if (colNameInput && colTypeInput) {
                columns.push({
                    name: colNameInput.value,
                    type: colTypeInput.value
                });
            }
        }

        const columnsSql = columns.map(col => `${col.name} ${col.type}`).join(', ');
        const sqlCommand = `CREATE TABLE IF NOT EXISTS ${data.tableName} (${columnsSql})`;
        
        // Display SQL command immediately
        displaySQLCommand(sqlCommand);

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
            currentTableName = data.tableName;
            // Use silent reload to preserve the CREATE command display
            setTimeout(() => {
                loadTableDataSilent(currentTableName);
            }, 500);
        })
        .catch(err => {
            console.error(err);
            alert('Error creating table');
        });

        return;
    }

    // Handle other operations
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
    let sqlCommand = '';

    switch (op) {
        case 'Insert':
            payload = {
                tableName: data.tableName,
                columns: data.columns,
                values: data.values
            };
            sqlCommand = `INSERT INTO ${data.tableName} (${data.columns}) VALUES (${data.values})`;
            break;
        case 'Select':
            payload = {
                tableName: data.tableName,
                where: data.where || ''
            };
            sqlCommand = `SELECT * FROM ${data.tableName}${data.where ? ` WHERE ${data.where}` : ''}`;
            break;
        case 'Update':
            payload = {
                tableName: data.tableName,
                set: data.set,
                where: data.where
            };
            sqlCommand = `UPDATE ${data.tableName} SET ${data.set} WHERE ${data.where}`;
            break;
        case 'Delete':
            payload = {
                tableName: data.tableName,
                where: data.where
            };
            sqlCommand = `DELETE FROM ${data.tableName} WHERE ${data.where}`;
            break;
        case 'Drop':
            payload = {
                tableName: data.tableName
            };
            sqlCommand = `DROP TABLE IF EXISTS ${data.tableName}`;
            break;
        case 'Alter':
            payload = {
                tableName: data.tableName,
                command: data.command
            };
            sqlCommand = `ALTER TABLE ${data.tableName} ${data.command}`;
            break;
        default:
            console.warn('Unhandled operation');
            return;
    }

    // Display the SQL command IMMEDIATELY before executing
    displaySQLCommand(sqlCommand);

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
            alert(res.message || res.error || 'Operation completed successfully!');
            // For non-select operations, reload table data but preserve the command display
            if (op !== 'Drop' && op !== 'Select') {
                // Store the current command before reloading
                const currentCommand = document.getElementById('sql-command-display')?.textContent;
                setTimeout(() => {
                    loadTableDataSilent(data.tableName || currentTableName);
                    // Restore the original command after reload
                    if (currentCommand && !currentCommand.includes('SELECT')) {
                        displaySQLCommand(currentCommand);
                    }
                }, 500);
            } else if (op === 'Drop') {
                // For DROP operation, clear the table display
                const container = document.getElementById('table-container');
                container.innerHTML = `<div style="color: beige; text-align: center; padding: 20px;">
                    <h4>Table "${data.tableName}" has been dropped</h4>
                    <p>Select another table or create a new one.</p>
                </div>`;
            }
        }
        modal.classList.add('hidden');
    })
    .catch(err => {
        console.error(err);
        alert('Error: ' + err.message);
    });
});

// Function to load table data without changing SQL command display
async function loadTableDataSilent(tableName) {
    const container = document.getElementById('table-container');
    container.style.display = 'block';

    try {
        const res = await fetch('/select', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tableName: tableName })
        });

        if (!res.ok) throw new Error("Failed to fetch");

        const data = await res.json();
        displayTableData(data, tableName);

    } catch (err) {
        console.error("Fetch failed:", err);
        container.innerHTML = `<div style="color: beige; text-align: center; padding: 20px;">
            <h4>Table: ${tableName}</h4>
            <p>Error loading table: ${err.message}</p>
        </div>`;
    }
}

// Function to load table data
async function loadTableData(tableName) {
    const container = document.getElementById('table-container');
    container.style.display = 'block';

    const selectCommand = `SELECT * FROM ${tableName}`;
    displaySQLCommand(selectCommand);

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
        console.error("Fetch failed:", err);
        container.innerHTML = `<div style="color: beige; text-align: center; padding: 20px;">
            <h4>Table: ${tableName}</h4>
        </div>`;
        
        // Update SQL command to show error
        displaySQLCommand(`SELECT * FROM ${tableName} -- Error: ${err.message}`);
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
        <div style="display: flex; justify-content: space-between; align-items: center; color: beige; margin-bottom: 10px;">
            <h4>Table: ${tableName}</h4>
            <button onclick="exportTableToCSV('${tableName}')" style="background: #8263ca; color: white; padding: 5px 10px; border: none; border-radius: 3px; cursor: pointer;">
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
    const exportCommand = `SELECT * FROM ${tableName} -- Exporting to CSV`;
    displaySQLCommand(exportCommand);

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
        displaySQLCommand(`SELECT * FROM ${tableName} -- Export failed: ${err.message}`);
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

            // Display CREATE TABLE command
            const columns = headers.map(header => ({
                name: header,
                type: 'TEXT' // Default to TEXT type
            }));
            const columnsSql = columns.map(col => `${col.name} ${col.type}`).join(', ');
            const createCommand = `CREATE TABLE IF NOT EXISTS ${tableName} (${columnsSql}) -- Importing CSV`;
            
            displaySQLCommand(createCommand);

            // Create table first
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
            let insertCount = 0;
            for (let i = 1; i < lines.length; i++) {
                const values = lines[i].split(',').map(v => v.trim());
                if (values.length !== headers.length) continue;

                const formattedValues = values.map(v => {
                    // Remove quotes and escape single quotes
                    v = v.replace(/^"(.*)"$/, '$1').replace(/'/g, "''");
                    return `'${v}'`;
                }).join(',');

                const insertCommand = `INSERT INTO ${tableName} (${headers.join(',')}) VALUES (${formattedValues})`;
                displaySQLCommand(insertCommand);

                await fetch('/insert', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        tableName: tableName,
                        columns: headers.join(','),
                        values: formattedValues
                    })
                });
                
                insertCount++;
            }

            currentTableName = tableName;
            // Use silent reload to preserve the import command display
            setTimeout(() => {
                loadTableDataSilent(tableName);
            }, 500);
            alert(`CSV imported successfully as table "${tableName}"! ${insertCount} rows inserted.`);

        } catch (err) {
            console.error('Import failed:', err);
            alert('Error importing CSV: ' + err.message);
            displaySQLCommand(`-- Import failed: ${err.message}`);
        }
    };
    input.click();
}

// Enhanced DOM ready event listener
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing...');
    
    // Initialize with welcome message
    displaySQLCommand('Welcome! Execute a SQL operation to see the command here.');
    
    // Try to load default table
    console.log('Loading default table...');
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

    const importBtn = document.querySelector('.import-btn-main');
    if (importBtn) {
        importBtn.addEventListener('click', importCSV);
    }
    
    // Debug: Log available elements
    console.log('Available SQL-related elements:', {
        'sql-command-display': document.getElementById('sql-command-display'),
        'sql-command-box': document.getElementById('sql-command-box'),
        'table-container': document.getElementById('table-container')
    });
});