const db = require('../config/database');

const MovieModel = {
    getAll: (callback) => {
        const query = `
            SELECT movies.*, categories.name AS category_name 
            FROM movies 
            LEFT JOIN categories ON movies.category_id = categories.id
            ORDER BY movies.id DESC
        `;
        db.all(query, [], (err, rows) => {
            callback(err, rows);
        });
    },

    create: (movieData, callback) => {
        const query = `
            INSERT INTO movies (title, director, release_year, status, rating, personal_note, category_id, runtime, poster_url) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [
            movieData.title,
            movieData.director,
            movieData.release_year,
            movieData.status,
            movieData.rating,
            movieData.personal_note,
            movieData.category_id,
            movieData.runtime,
            movieData.poster_url
        ];
        db.run(query, params, function (err) {
            callback(err, this ? this.lastID : null);
        });
    },

    update: (id, movieData, callback) => {
        const query = `
            UPDATE movies 
            SET title = ?, director = ?, release_year = ?, status = ?, rating = ?, personal_note = ?, category_id = ?, runtime = ?, poster_url = ?
            WHERE id = ?
        `;
        const params = [
            movieData.title,
            movieData.director,
            movieData.release_year,
            movieData.status,
            movieData.rating,
            movieData.personal_note,
            movieData.category_id,
            movieData.runtime,
            movieData.poster_url,
            id
        ];
        db.run(query, params, function (err) {
            callback(err);
        });
    },

    delete: (id, callback) => {
        db.run(`DELETE FROM movies WHERE id = ?`, [id], (err) => {
            callback(err);
        });
    },

    search: (title, categoryId, callback) => {
        let query = `
            SELECT movies.*, categories.name AS category_name 
            FROM movies 
            LEFT JOIN categories ON movies.category_id = categories.id
            WHERE 1=1
        `;
        const params = [];

        if (title) {
            query += ` AND movies.title LIKE ?`;
            params.push(`%${title}%`);
        }
        if (categoryId) {
            query += ` AND movies.category_id = ?`;
            params.push(categoryId);
        }

        query += ` ORDER BY movies.id DESC`;

        db.all(query, params, (err, rows) => {
            callback(err, rows);
        });
    }
};

module.exports = MovieModel;