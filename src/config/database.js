const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../../watchlist.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Database connection error:', err.message);
    } else {
        console.log('Successfully connected to SQLite database.');
    }
});

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE
        )
    `);
    
    db.run(`
        CREATE TABLE IF NOT EXISTS movies (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            director TEXT,
            release_year INTEGER,
            status TEXT NOT NULL CHECK(status IN ('To Watch', 'Watched')),
            rating INTEGER CHECK(rating >= 1 AND rating <= 5),
            personal_note TEXT,
            category_id INTEGER,
            runtime INTEGER,
            poster_url TEXT,
            FOREIGN KEY (category_id) REFERENCES categories(id)
        )
    `);

    const defaultCategories = ['Action', 'Drama', 'Sci-Fi', 'Comedy'];
    defaultCategories.forEach((cat, index) => {
        const forcedId = index + 1;
        db.run(`INSERT OR IGNORE INTO categories (id, name) VALUES (?, ?)`, [forcedId, cat]);
    });
});

module.exports = db;