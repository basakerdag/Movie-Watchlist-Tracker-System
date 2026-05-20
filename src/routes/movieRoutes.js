const express = require('express');
const router = express.Router();
const MovieController = require('../controllers/movieController');

router.get('/search', MovieController.searchMovies);
router.patch('/:id/toggle-status', MovieController.toggleStatus); // <-- EKSİK OLAN SATIR

router.get('/', MovieController.getAllMovies);
router.post('/', MovieController.createMovie);
router.put('/:id', MovieController.updateMovie);
router.delete('/:id', MovieController.deleteMovie);

module.exports = router;