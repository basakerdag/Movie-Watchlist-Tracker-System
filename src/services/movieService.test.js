const MovieService = require('./movieService');
const MovieModel = require('../models/movieModel');

jest.mock('../models/movieModel');

describe('MovieService - Unit Tests for Business Logic', () => {
    
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('validateAndCreateMovie should pass and call Model.create when data is valid', () => {
        const validMovie = {
            title: 'Interstellar',
            director: 'Christopher Nolan',
            release_year: 2014,
            status: 'To Watch',
            rating: null,
            runtime: 169,
            poster_url: 'https://example.com/poster.jpg'
        };

        MovieModel.create.mockImplementation((data, callback) => callback(null, 1));

        MovieService.validateAndCreateMovie(validMovie, (err, insertId) => {
            expect(err).toBeNull();
            expect(insertId).toBe(1);
            expect(MovieModel.create).toHaveBeenCalledWith(validMovie, expect.any(Function));
        });
    });

    test('validateAndCreateMovie should return error if title is empty', () => {
        const invalidMovie = {
            title: '   ', 
            status: 'To Watch'
        };

        MovieService.validateAndCreateMovie(invalidMovie, (err, insertId) => {
            expect(err).toBeTruthy();
            expect(err.message).toBe('Movie title cannot be empty.');
            expect(MovieModel.create).not.toHaveBeenCalled();
        });
    });

    test('validateAndCreateMovie should return error if runtime is zero or negative', () => {
        const invalidMovie = {
            title: 'Inception',
            runtime: -5, 
            status: 'To Watch'
        };

        MovieService.validateAndCreateMovie(invalidMovie, (err, insertId) => {
            expect(err).toBeTruthy();
            expect(err.message).toBe('Movie runtime must be a positive number of minutes.');
            expect(MovieModel.create).not.toHaveBeenCalled();
        });
    });

    test('validateAndCreateMovie should return error if a To Watch movie has a rating', () => {
        const invalidMovie = {
            title: 'The Dark Knight',
            status: 'To Watch',
            rating: 5 
        };

        MovieService.validateAndCreateMovie(invalidMovie, (err, insertId) => {
            expect(err).toBeTruthy();
            expect(err.message).toBe('You cannot rate a movie that you have not watched yet.');
            expect(MovieModel.create).not.toHaveBeenCalled();
        });
    });

    test('validateAndCreateMovie should return error if a Watched movie has an invalid rating', () => {
        const invalidMovie = {
            title: 'Memento',
            status: 'Watched',
            rating: 10 
        };

        MovieService.validateAndCreateMovie(invalidMovie, (err, insertId) => {
            expect(err).toBeTruthy();
            expect(err.message).toBe('You must provide a rating between 1 and 5 for watched movies.');
            expect(MovieModel.create).not.toHaveBeenCalled();
        });
    });
});