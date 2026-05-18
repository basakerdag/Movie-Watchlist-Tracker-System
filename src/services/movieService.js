const MovieModel = require('../models/movieModel');

const MovieService = {
    validateAndCreateMovie: (movieData, callback) => {
        const { title, release_year, status, rating } = movieData;

        if (!title || title.trim() === '') {
            return callback(new Error('Movie title cannot be empty.'));
        }
        if (!status || (status !== 'To Watch' && status !== 'Watched')) {
            return callback(new Error('Invalid watchlist status.'));
        }
        if (release_year && (release_year < 1888 || release_year > 2026)) {
            return callback(new Error('Invalid release year.'));
        }
        if (status === 'To Watch' && rating) {
            return callback(new Error('You cannot rate a movie that you have not watched yet.'));
        }
        if (status === 'Watched' && (!rating || rating < 1 || rating > 5)) {
            return callback(new Error('You must provide a rating between 1 and 5 for watched movies.'));
        }

        MovieModel.create(movieData, callback);
    },
    getAllMovies: (callback) => {
        MovieModel.getAll(callback);
    },
    deleteMovie: (id, callback) => {
        if (!id) return callback(new Error('Invalid movie ID.'));
        MovieModel.delete(id, callback);
    }
};

module.exports = MovieService;