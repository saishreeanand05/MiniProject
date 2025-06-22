import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import students from './api.js';
import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./gui_rdbms.db');
const app = express();
const port = 3000;

// Fix for __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, '../frontend')));
app.use(express.json());

app.get('/', (req,res) => {
    res.sendFile(path.join(__dirname, '../frontend/landing.html'));
});

// Send mock students data (fallback)
app.get('/students', (req, res) => {
    res.json(students);
});

// Get all tables in database
app.get('/tables', (req, res) => {
    const query = `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'`;
    db.all(query, (err, tables) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(tables.map(table => table.name));
    });
});

// Create Table
app.post('/create', (req, res) => {
    const { tableName, columns } = req.body;

    if (!tableName || !columns || columns.length === 0) {
        return res.status(400).json({ error: 'Table name or columns missing' });
    }

    const columnsSql = columns.map(col => `\`${col.name}\` ${col.type}`).join(', ');
    const createQuery = `CREATE TABLE IF NOT EXISTS \`${tableName}\` (${columnsSql})`;
    
    db.run(createQuery, (err) => {
        if (err) {
            console.error('Error creating table:', err);
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: `Table "${tableName}" created successfully.` });
    });
});

// Insert Row
app.post('/insert', (req, res) => {
    const { tableName, columns, values } = req.body;

    if (!tableName || !columns || !values) {
        return res.status(400).json({ error: 'Missing data for insert' });
    }

    const query = `INSERT INTO \`${tableName}\` (${columns}) VALUES (${values})`;
    db.run(query, function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: `Row inserted into ${tableName}` });
    });
});

// Select Query
app.post('/select', (req, res) => {
    const { tableName, where } = req.body;
    
    if (!tableName) {
        return res.status(400).json({ error: 'Table name is required' });
    }
    
    const query = `SELECT * FROM \`${tableName}\`${where ? ` WHERE ${where}` : ''}`;

    db.all(query, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Update
app.post('/update', (req, res) => {
    const { tableName, set, where } = req.body;
    const query = `UPDATE \`${tableName}\` SET ${set} WHERE ${where}`;

    db.run(query, function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: `Table ${tableName} updated. Rows affected: ${this.changes}` });
    });
});

// Delete
app.post('/delete', (req, res) => {
    const { tableName, where } = req.body;
    const query = `DELETE FROM \`${tableName}\` WHERE ${where}`;

    db.run(query, function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: `Rows deleted from ${tableName}. Rows affected: ${this.changes}` });
    });
});

// Drop Table
app.post('/drop', (req, res) => {
    const { tableName } = req.body;
    const query = `DROP TABLE IF EXISTS \`${tableName}\``;

    db.run(query, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: `Table ${tableName} dropped.` });
    });
});

// Alter Table
app.post('/alter', (req, res) => {
    const { tableName, command } = req.body;
    const query = `ALTER TABLE \`${tableName}\` ${command}`;

    db.run(query, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: `Table ${tableName} altered.` });
    });
});

// Start server
app.listen(port, () => {
    console.log(`My SQL app listening on http://localhost:${port}`);
});