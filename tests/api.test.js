const request = require('supertest');
const express = require('express');
const movieRoutes = require('../src/routes/movieRoutes');

const app = express();
app.use(express.json());
app.use('/api/movies', movieRoutes);

describe('CineTrack API - Complete CRUD Integration Tests', () => {
    let createdMovieId = null;

    test('POST /api/movies -> Should successfully create a new movie record', async () => {
        const payload = {
            title: 'Inception',
            director: 'Christopher Nolan',
            release_year: 2010,
            status: 'To Watch',
            category_id: 3,
            runtime: 148,
            poster_url: ''
        };

        const response = await request(app)
            .post('/api/movies')
            .send(payload)
            .expect('Content-Type', /json/)
            .expect(201); // Created status code

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('id');
        
        createdMovieId = response.body.data.id;
    });

    test('GET /api/movies -> Should safely fetch all movies in catalog', async () => {
        const response = await request(app)
            .get('/api/movies')
            .expect('Content-Type', /json/)
            .expect(200); 

        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.data.length).toBeGreaterThan(0);
    });

    test('GET /api/movies/search -> Should query and filter data accurately', async () => {
        const response = await request(app)
            .get('/api/movies/search?title=Inception&status=To Watch')
            .expect('Content-Type', /json/)
            .expect(200);

        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('PUT /api/movies/:id -> Should update existing movie fields based on ID', async () => {
        const updatedPayload = {
            title: 'Inception (Updated)',
            director: 'C. Nolan',
            release_year: 2010,
            status: 'Watched', 
            rating: 5,         
            personal_note: 'An absolute masterpiece of psychological sci-fi.',
            category_id: 3,
            runtime: 148,
            poster_url: ''
        };

        const response = await request(app)
            .put(`/api/movies/${createdMovieId}`)
            .send(updatedPayload)
            .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('Movie updated successfully.');
    });

    test('DELETE /api/movies/:id -> Should wipe out the specified record from database', async () => {
        const response = await request(app)
            .delete(`/api/movies/${createdMovieId}`)
            .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('Movie deleted successfully.');
    });
});