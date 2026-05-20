const express = require('express');
const router = express.Router();
const MovieController = require('../controllers/movieController');

router.get('/search', MovieController.searchMovies);
router.patch('/:id/toggle-status', MovieController.toggleStatus); 

router.get('/', MovieController.getAllMovies);
router.post('/', MovieController.createMovie);
router.put('/:id', MovieController.updateMovie);
router.delete('/:id', MovieController.deleteMovie);

router.get('/external-search', MovieController.searchExternalMovie);
module.exports = router;