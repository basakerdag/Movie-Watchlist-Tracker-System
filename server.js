const express = require('express');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const movieRoutes = require('./src/routes/movieRoutes');

const app = process.env.EXPRESS_APP || express();
const PORT = process.env.PORT || 3000;

const OMDB_API_KEY = 'aa82e562';

process.env.OMDB_API_KEY = OMDB_API_KEY;

app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/api/movies', movieRoutes);
app.use(express.static(path.join(__dirname, 'src/public')));

if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`Server is running smoothly on http://localhost:${PORT}`);
        console.log(`Swagger documentation is live at http://localhost:${PORT}/api-docs`);
    });
}

module.exports = app;