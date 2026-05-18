const express = require('express');
const path = require('path');
const movieRoutes = require('./src/routes/movieRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/api/movies', movieRoutes);

app.use(express.static(path.join(__dirname, 'src/public')));

app.listen(PORT, () => {
    console.log(`Server is running smoothly on http://localhost:${PORT}`);
});