const db = require('../config/database');

const MovieModel = {
    getAll: (callback) => {
        const query = `
            SELECT movies.*, categories.name as category_name 
            FROM movies 
            LEFT JOIN categories ON movies.category_id = categories.id
        `;
        db.all(query, [], (err, rows) => callback(err, rows));
    },
    create: (movieData, callback) => {
        const { title, director, release_year, status, rating, personal_note, category_id } = movieData;
        const query = `
            INSERT INTO movies (title, director, release_year, status, rating, personal_note, category_id)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        db.run(query, [title, director, release_year, status, rating, personal_note, category_id], function(err) {
            callback(err, this ? this.lastID : null);
        });
    },
    delete: (id, callback) => {
        const query = 'DELETE FROM movies WHERE id = ?';
        db.run(query, [id], (err) => callback(err));
    }
};

module.exports = MovieModel;