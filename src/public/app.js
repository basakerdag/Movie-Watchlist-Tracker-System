document.addEventListener('DOMContentLoaded', () => {
    const movieForm = document.getElementById('movieForm');
    const formTitle = movieForm.querySelector('h5');
    const submitBtn = movieForm.querySelector('button[type="submit"]');
    const statusSelect = document.getElementById('status');
    const watchedFields = document.getElementById('watchedFields');
    const movieTableBody = document.getElementById('movieTableBody');
    const ratingInput = document.getElementById('rating');
    
    let editingMovieId = null; 

    statusSelect.addEventListener('change', () => {
        if (statusSelect.value === 'Watched') {
            watchedFields.style.display = 'block';
            ratingInput.required = true;
        } else {
            watchedFields.style.display = 'none';
            ratingInput.required = false;
            ratingInput.value = '';
        }
    });

    const loadMovies = async () => {
        try {
            const response = await fetch('/api/movies');
            const result = await response.json();
            
            if (result.success) {
                movieTableBody.innerHTML = '';
                result.data.forEach(movie => {
                    const row = document.createElement('tr');
                    row.className = "border-secondary";
                    row.innerHTML = `
                        <td><span class="text-white fw-semibold">${movie.title}</span></td>
                        <td>${movie.director || '<span class="text-muted">-</span>'}</td>
                        <td>${movie.release_year || '<span class="text-muted">-</span>'}</td>
                        <td><span class="badge bg-secondary text-light opacity-75">${movie.category_name || 'Uncategorized'}</span></td>
                        <td>
                            <span class="badge ${movie.status === 'Watched' ? 'badge-watched' : 'badge-towatch'}">
                                ${movie.status}
                            </span>
                        </td>
                        <td class="rating-stars">${movie.rating ? '★'.repeat(movie.rating) : '<span class="text-muted">-</span>'}</td>
                        <td class="text-end">
                            <button class="btn btn-sm btn-outline-info me-1 px-2 edit-btn" 
                                    data-id="${movie.id}" 
                                    data-title="${movie.title}" 
                                    data-director="${movie.director || ''}" 
                                    data-year="${movie.release_year || ''}" 
                                    data-category="${movie.category_id || 1}" 
                                    data-status="${movie.status}" 
                                    data-rating="${movie.rating || ''}" 
                                    data-note="${movie.personal_note || ''}">Edit</button>
                            <button class="btn btn-sm btn-outline-danger px-2 delete-btn" data-id="${movie.id}">Remove</button>
                        </td>
                    `;
                    movieTableBody.appendChild(row);
                });

                document.querySelectorAll('.delete-btn').forEach(btn => btn.addEventListener('click', deleteMovie));
                document.querySelectorAll('.edit-btn').forEach(btn => btn.addEventListener('click', startEditMode));
            }
        } catch (error) {
            console.error('Error loading dataset:', error);
        }
    };

    const startEditMode = (e) => {
        const btn = e.target;
        editingMovieId = btn.getAttribute('data-id');

        document.getElementById('title').value = btn.getAttribute('data-title');
        document.getElementById('director').value = btn.getAttribute('data-director');
        document.getElementById('releaseYear').value = btn.getAttribute('data-year');
        document.getElementById('category').value = btn.getAttribute('data-category');
        document.getElementById('status').value = btn.getAttribute('data-status');
        
        if (btn.getAttribute('data-status') === 'Watched') {
            watchedFields.style.display = 'block';
            ratingInput.value = btn.getAttribute('data-rating');
            document.getElementById('personalNote').value = btn.getAttribute('data-note');
            ratingInput.required = true;
        } else {
            watchedFields.style.display = 'none';
            ratingInput.value = '';
            document.getElementById('personalNote').value = '';
            ratingInput.required = false;
        }

        formTitle.textContent = "Update Movie";
        submitBtn.textContent = "Update Changes";
        submitBtn.className = "btn btn-info btn-lg w-100 mt-2";
    };

    movieForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const title = document.getElementById('title').value.trim();
        const movieData = {
            title,
            director: document.getElementById('director').value.trim(),
            release_year: parseInt(document.getElementById('releaseYear').value) || null,
            status: statusSelect.value,
            rating: parseInt(ratingInput.value) || null,
            personal_note: document.getElementById('personalNote').value.trim(),
            category_id: parseInt(document.getElementById('category').value)
        };

        const url = editingMovieId ? `/api/movies/${editingMovieId}` : '/api/movies';
        const method = editingMovieId ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(movieData)
            });

            const result = await response.json();

            if (result.success) {
                movieForm.reset();
                watchedFields.style.display = 'none';
                
                editingMovieId = null;
                formTitle.textContent = "Add Movie Tracker";
                submitBtn.textContent = "Save Movie";
                submitBtn.className = "btn btn-primary btn-lg w-100 mt-2";
                
                loadMovies(); 
            } else {
                alert('Validation Error: ' + result.message);
            }
        } catch (error) {
            console.error('Transaction pipeline exception:', error);
        }
    });

    const deleteMovie = async (e) => {
        const id = e.target.getAttribute('data-id');
        if (!confirm('Are you sure you want to remove this record permanently?')) return;

        try {
            const response = await fetch(`/api/movies/${id}`, { method: 'DELETE' });
            const result = await response.json();
            if (result.success) loadMovies();
        } catch (error) {
            console.error('Delete worker crashed:', error);
        }
    };

    const searchInput = document.getElementById('searchInput');
    const filterCategory = document.getElementById('filterCategory');

    const triggerSearch = async () => {
        const title = searchInput.value.trim();
        const categoryId = filterCategory.value;

        try {
            const response = await fetch(`/api/movies/search?title=${encodeURIComponent(title)}&categoryId=${categoryId}`);
            const result = await response.json();

            if (result.success) {
                movieTableBody.innerHTML = '';
                result.data.forEach(movie => {
                    const row = document.createElement('tr');
                    row.className = "border-secondary";
                    row.innerHTML = `
                        <td><span class="text-white fw-semibold">${movie.title}</span></td>
                        <td>${movie.director || '<span class="text-muted">-</span>'}</td>
                        <td>${movie.release_year || '<span class="text-muted">-</span>'}</td>
                        <td><span class="badge bg-secondary text-light opacity-75">${movie.category_name || 'Uncategorized'}</span></td>
                        <td>
                            <span class="badge ${movie.status === 'Watched' ? 'badge-watched' : 'badge-towatch'}">
                                ${movie.status}
                            </span>
                        </td>
                        <td class="rating-stars">${movie.rating ? '★'.repeat(movie.rating) : '<span class="text-muted">-</span>'}</td>
                        <td class="text-end">
                            <button class="btn btn-sm btn-outline-info me-1 px-2 edit-btn" 
                                    data-id="${movie.id}" data-title="${movie.title}" data-director="${movie.director || ''}" 
                                    data-year="${movie.release_year || ''}" data-category="${movie.category_id || 1}" 
                                    data-status="${movie.status}" data-rating="${movie.rating || ''}" data-note="${movie.personal_note || ''}">Edit</button>
                            <button class="btn btn-sm btn-outline-danger px-2 delete-btn" data-id="${movie.id}">Remove</button>
                        </td>
                    `;
                    movieTableBody.appendChild(row);
                });

                document.querySelectorAll('.delete-btn').forEach(btn => btn.addEventListener('click', deleteMovie));
                document.querySelectorAll('.edit-btn').forEach(btn => btn.addEventListener('click', startEditMode));
            }
        } catch (error) {
            console.error('Search pipeline crashed:', error);
        }
    };

    searchInput.addEventListener('input', triggerSearch);
    filterCategory.addEventListener('change', triggerSearch);

    loadMovies();
});