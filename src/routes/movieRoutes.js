const express = require('express');
const router = express.Router();
const MovieController = require('../controllers/movieController');

router.get('/', MovieController.getAllMovies);
router.post('/', MovieController.createMovie);
router.delete('/:id', MovieController.deleteMovie);

module.exports = router;