document.addEventListener('DOMContentLoaded', () => {
    const movieFormContainer = document.getElementById('movieForm');
    const formTitle = movieFormContainer.querySelector('h5');
    const submitBtn = movieFormContainer.querySelector('button[type="submit"]');
    const actualForm = document.getElementById('actualForm');
    const statusSelect = document.getElementById('status');
    const watchedFields = document.getElementById('watchedFields');
    const movieTableBody = document.getElementById('movieTableBody');
    const ratingInput = document.getElementById('rating');
    
    let editingMovieId = null; 

    const defaultPoster = "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=2070&auto=format&fit=crop";

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

    const updateDashboardMetrics = (movies) => {
        const totalMovies = movies.length;
        let totalRuntime = 0;
        let ratedMoviesCount = 0;
        let totalRatingSum = 0;

        movies.forEach(m => {
            if (m.runtime) totalRuntime += parseInt(m.runtime);
            if (m.status === 'Watched' && m.rating) {
                ratedMoviesCount++;
                totalRatingSum += parseInt(m.rating);
            }
        });

        const avgRating = ratedMoviesCount > 0 ? (totalRatingSum / ratedMoviesCount).toFixed(1) : "0.0";

        document.getElementById('statTotal').textContent = totalMovies;
        document.getElementById('statRuntime').textContent = `${totalRuntime} Min`;
        document.getElementById('statRating').textContent = `${avgRating} / 5 ⭐`;
    };

    const renderTableRows = (movies) => {
        movieTableBody.innerHTML = '';
        updateDashboardMetrics(movies);
        
        if (!movies || movies.length === 0) {
            movieTableBody.innerHTML = `<tr><td colspan="8" class="text-center text-muted py-4">No movies found matching your catalog criteria.</td></tr>`;
            return;
        }

        movies.forEach(movie => {
            const row = document.createElement('tr');
            row.className = "border-secondary text-white align-middle";
            
            const currentStatus = movie.status || 'To Watch';
            const statusClass = (currentStatus.toLowerCase().includes('watch')) ? 'badge-towatch' : 'badge-watched';
            const displayPoster = movie.poster_url && movie.poster_url.trim() !== '' ? movie.poster_url : defaultPoster;
            
            row.innerHTML = `
                <td>
                    <img src="${displayPoster}" class="movie-poster" alt="Poster" onerror="this.src='${defaultPoster}'">
                </td>
                <td>
                    <span class="text-white fw-semibold d-block">${movie.title}</span>
                    ${movie.runtime ? `<small class="text-muted">${movie.runtime} min</small>` : ''}
                </td>
                <td>${movie.director || '<span class="text-muted">-</span>'}</td>
                <td>${movie.release_year || '<span class="text-muted">-</span>'}</td>
                <td><span class="badge bg-secondary text-light opacity-75">${movie.category_name || 'General'}</span></td>
                <td>
                    <span class="badge ${statusClass} status-toggle-btn" 
                          style="cursor: pointer;" 
                          data-id="${movie.id}" 
                          data-status="${currentStatus}"
                          title="Click to change watch status">
                        ${currentStatus} 🎬
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
                            data-status="${currentStatus}" 
                            data-rating="${movie.rating || ''}" 
                            data-runtime="${movie.runtime || ''}"
                            data-poster="${movie.poster_url || ''}"
                            data-note="${movie.personal_note || ''}">Edit</button>
                    <button class="btn btn-sm btn-outline-danger px-2 delete-btn" data-id="${movie.id}">Remove</button>
                </td>
            `;
            movieTableBody.appendChild(row);
        });

        movieTableBody.querySelectorAll('.delete-btn').forEach(btn => btn.addEventListener('click', deleteMovie));
        movieTableBody.querySelectorAll('.edit-btn').forEach(btn => btn.addEventListener('click', startEditMode));

        // 🔥 GÜVENLİ VE PROMPT KULLANMAYAN YENİ SATIR İÇİ DURUM DEĞİŞTİRİCİ
        movieTableBody.querySelectorAll('.status-toggle-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.target.getAttribute('data-id');
                const currentStatus = e.target.getAttribute('data-status');
                
                let rating = null;
                let personal_note = "";

                if (currentStatus === 'To Watch') {
                    rating = 5;
                    personal_note = "Marked as watched via quick status dashboard.";
                } else {
                    if (!confirm("Move this movie back to your 'To Watch' list? Your rating and notes will be cleared.")) return;
                }

                try {
                    const response = await fetch(`/api/movies/${id}/toggle-status`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ currentStatus, rating, personal_note })
                    });
                    
                    const result = await response.json();
                    if (result.success) {
                        loadMovies(); // Sayfa yenilenmeden verileri ve üst paneli canlı güncelle!
                    } else {
                        alert("Validation or Database Error: " + result.message);
                    }
                } catch (error) {
                    console.error("Status toggle network failure:", error);
                }
            });
        });
    };

    const loadMovies = async () => {
        try {
            const response = await fetch('/api/movies');
            const result = await response.json();
            if (result.success) {
                renderTableRows(result.data);
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
        document.getElementById('runtime').value = btn.getAttribute('data-runtime');
        document.getElementById('posterUrl').value = btn.getAttribute('data-poster');
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

    actualForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const movieData = {
            title: document.getElementById('title').value.trim(),
            director: document.getElementById('director').value.trim(),
            release_year: parseInt(document.getElementById('releaseYear').value) || null,
            status: statusSelect.value,
            rating: parseInt(ratingInput.value) || null,
            personal_note: document.getElementById('personalNote').value.trim(),
            category_id: parseInt(document.getElementById('category').value),
            runtime: parseInt(document.getElementById('runtime').value) || null,
            poster_url: document.getElementById('posterUrl').value.trim()
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
                actualForm.reset();
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
                renderTableRows(result.data);
            }
        } catch (error) {
            console.error('Search pipeline crashed:', error);
        }
    };

    if (searchInput) searchInput.addEventListener('input', triggerSearch);
    if (filterCategory) filterCategory.addEventListener('change', triggerSearch);

    loadMovies();
});