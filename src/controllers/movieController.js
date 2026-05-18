const MovieService = require('../services/movieService');

const MovieController = {
    getAllMovies: (req, res) => {
        MovieService.getAllMovies((err, movies) => {
            if (err) return res.status(500).json({ success: false, message: err.message });
            res.status(200).json({ success: true, data: movies });
        });
    },
    createMovie: (req, res) => {
        MovieService.validateAndCreateMovie(req.body, (err, insertId) => {
            if (err) return res.status(400).json({ success: false, message: err.message });
            res.status(201).json({ success: true, message: 'Movie successfully added.', data: { id: insertId } });
        });
    },
    deleteMovie: (req, res) => {
        MovieService.deleteMovie(req.params.id, (err) => {
            if (err) return res.status(400).json({ success: false, message: err.message });
            res.status(200).json({ success: true, message: 'Movie deleted successfully.' });
        });
    }
};

module.exports = MovieController;