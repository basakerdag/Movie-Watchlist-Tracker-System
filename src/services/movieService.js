const MovieModel = require('../models/movieModel');

const MovieService = {
    getAllMovies: (callback) => {
        MovieModel.getAll(callback);
    },

    validateAndCreateMovie: (movieData, callback) => {
        if (!movieData.title || movieData.title.trim() === '') {
            return callback(new Error('Movie title cannot be empty.'));
        }

        if (movieData.runtime !== null && movieData.runtime <= 0) {
            return callback(new Error('Movie runtime must be a positive number of minutes.'));
        }

        if (movieData.status === 'To Watch' && movieData.rating) {
            return callback(new Error('You cannot rate a movie that you have not watched yet.'));
        }

        if (movieData.status === 'Watched' && (!movieData.rating || movieData.rating < 1 || movieData.rating > 5)) {
            return callback(new Error('You must provide a rating between 1 and 5 for watched movies.'));
        }

        MovieModel.create(movieData, callback);
    },

    validateAndUpdateMovie: (id, movieData, callback) => {
        if (!movieData.title || movieData.title.trim() === '') {
            return callback(new Error('Movie title cannot be empty.'));
        }
        if (movieData.runtime !== null && movieData.runtime <= 0) {
            return callback(new Error('Movie runtime must be a positive number of minutes.'));
        }
        if (movieData.status === 'To Watch' && movieData.rating) {
            return callback(new Error('You cannot rate a movie that you have not watched yet.'));
        }
        if (movieData.status === 'Watched' && (!movieData.rating || movieData.rating < 1 || movieData.rating > 5)) {
            return callback(new Error('You must provide a rating between 1 and 5 for watched movies.'));
        }

        MovieModel.update(id, movieData, callback);
    },

    deleteMovie: (id, callback) => {
        MovieModel.delete(id, callback);
    },

    searchMovies: (title, categoryId, status, callback) => {
        MovieModel.search(title, categoryId, status,callback);
    },
    toggleMovieStatus: (id, currentStatus, additionalData, callback) => {
        if (!id) return callback(new Error('Invalid movie ID.'));

        const nextStatus = currentStatus === 'To Watch' ? 'Watched' : 'To Watch';
        
        MovieModel.getAll((err, allMovies) => {
            if (err) return callback(err);
            
            const movie = allMovies.find(m => m.id == id);
            if (!movie) return callback(new Error('Movie record not found.'));

            const updatedMovieData = {
                title: movie.title,
                director: movie.director,
                release_year: movie.release_year,
                category_id: movie.category_id,
                runtime: movie.runtime,
                poster_url: movie.poster_url,
                status: nextStatus,
                rating: nextStatus === 'Watched' ? (additionalData.rating || 5) : null,
                personal_note: nextStatus === 'Watched' ? (additionalData.personal_note || '') : ''
            };

            if (updatedMovieData.status === 'Watched' && (!updatedMovieData.rating || updatedMovieData.rating < 1 || updatedMovieData.rating > 5)) {
                return callback(new Error('A rating between 1 and 5 is required when marking as Watched.'));
            }

            MovieModel.update(id, updatedMovieData, callback);
        });
    },
};

module.exports = MovieService;