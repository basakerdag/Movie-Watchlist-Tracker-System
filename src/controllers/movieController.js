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
    },
    updateMovie: (req, res) => {
        const movieId = req.params.id;
        const movieData = req.body;

        MovieService.validateAndUpdateMovie(movieId, movieData, (err) => {
            if (err) return res.status(400).json({ success: false, message: err.message });
            res.status(200).json({ success: true, message: 'Movie updated successfully.' });
        });
    }, 
    searchMovies: (req, res) => {
        const { title, categoryId, status } = req.query; 

        MovieService.searchMovies(title, categoryId, status, (err, movies) => {
            if (err) return res.status(500).json({ success: false, message: err.message });
            res.status(200).json({ success: true, data: movies });
        });
    },
    searchExternalMovie: async (req, res) => {
        const { title, year } = req.query;
        if (!title) {
            return res.status(400).json({ success: false, message: 'Title query parameter is required.' });
        }

        const apiKey = process.env.OMDB_API_KEY;

        if (!apiKey) {
            return res.status(500).json({ success: false, message: 'OMDb API Key registry missing on application bootstrap.' });
        }

        try {
            let externalApiUrl = `http://www.omdbapi.com/?apikey=${apiKey}&t=${encodeURIComponent(title)}`;
            
            if (year && year !== 'null' && year !== 'undefined' && year !== '') {
                externalApiUrl += `&y=${year}`;
            }

            const response = await fetch(externalApiUrl);
            const movieData = await response.json();

            if (movieData.Response === "False") {
                return res.status(404).json({ success: false, message: 'Movie not found in Hollywood database.' });
            }
            
            const extractedPlot = movieData.Plot && movieData.Plot !== "N/A" ? movieData.Plot : "No extended synopsis available in public registries.";
            const extractedActors = movieData.Actors && movieData.Actors !== "N/A" ? movieData.Actors : "Cast details not fully indexed.";
            const extractedAwards = movieData.Awards && movieData.Awards !== "N/A" ? movieData.Awards : "No international awards listed.";
            const extractedRating = movieData.imdbRating && movieData.imdbRating !== "N/A" ? movieData.imdbRating : "N/A";
            
            const extractedPoster = movieData.Poster && movieData.Poster !== "N/A" ? movieData.Poster : null;

            res.status(200).json({
                success: true,
                data: {
                    plot: extractedPlot,
                    actors: extractedActors,
                    imdbRating: extractedRating,
                    awards: extractedAwards,
                    poster: extractedPoster 
                }
            });
        } catch (error) {
            console.error('External API Proxy error:', error);
            res.status(500).json({ success: false, message: 'Failed to fetch data from external cinema registry.' });
        }
    },
    toggleStatus: (req, res) => {
        const movieId = req.params.id;
        const { currentStatus, rating, personal_note } = req.body;

        MovieService.toggleMovieStatus(movieId, currentStatus, { rating, personal_note }, (err) => {
            if (err) return res.status(400).json({ success: false, message: err.message });
            res.status(200).json({ success: true, message: 'Watch status toggled smoothly.' });
        });
    }
};

module.exports = MovieController;