const request = require('supertest');
const app = require('../server');

describe('🎬 CineTrack - External OMDb API Proxy Integration Tests', () => {
    
    beforeAll(() => {
        if (!process.env.OMDB_API_KEY) {
            process.env.OMDB_API_KEY = '71906969';
        }
    });

    describe('GET /api/movies/external-search', () => {

        it('should successfully fetch movie metadata from OMDb when valid title and year are provided', async () => {
            const response = await request(app)
                .get('/api/movies/external-search')
                .query({ title: 'Inception', year: 2010 })
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body).toHaveProperty('success', true);
            expect(response.body).toHaveProperty('data');
            expect(response.body.data).toHaveProperty('plot');
            expect(response.body.data).toHaveProperty('actors');
            expect(response.body.data).toHaveProperty('imdbRating');
            expect(response.body.data).toHaveProperty('awards');
            expect(response.body.data).toHaveProperty('poster');
            
            expect(response.body.data.actors).toContain('Leonardo DiCaprio');
        });

        it('should handle movie non-existence gracefully and return 404', async () => {
            const response = await request(app)
                .get('/api/movies/external-search')
                .query({ title: 'ThisMovieDoesNotExistInHollywood12345' })
                .expect('Content-Type', /json/)
                .expect(404);

            expect(response.body).toHaveProperty('success', false);
            expect(response.body).toHaveProperty('message', 'Movie not found in Hollywood database.');
        });

        it('should return 400 Bad Request when title parameter is missing', async () => {
            const response = await request(app)
                .get('/api/movies/external-search')
                .expect('Content-Type', /json/)
                .expect(400);

            expect(response.body).toHaveProperty('success', false);
            expect(response.body).toHaveProperty('message', 'Title query parameter is required.');
        });
        
    });
});