// Horror Movies App with Local Storage
class HorrorMoviesApp {
    constructor() {
        this.movies = [];
        this.filteredMovies = [];
        this.STORAGE_KEY = 'horrorMoviesRatings';
        this.init();
    }

    async init() {
        await this.loadMovies();
        this.loadRatingsFromStorage();
        this.setupEventListeners();
        this.renderMovies();
        this.updateStats();
    }

    async loadMovies() {
        try {
            const response = await fetch('horror-movies.json');
            this.movies = await response.json();
            this.filteredMovies = [...this.movies];
        } catch (error) {
            console.error('Error loading movies:', error);
            alert('Failed to load movies. Please make sure horror-movies.json is in the same directory.');
        }
    }

    loadRatingsFromStorage() {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (stored) {
            try {
                const ratings = JSON.parse(stored);
                // Apply stored ratings to movies
                this.movies.forEach(movie => {
                    if (ratings[movie.id] !== undefined) {
                        movie.rating = ratings[movie.id];
                    }
                });
                console.log('Ratings loaded from local storage');
            } catch (error) {
                console.error('Error parsing stored ratings:', error);
            }
        }
    }

    saveRatingsToStorage() {
        const ratings = {};
        this.movies.forEach(movie => {
            ratings[movie.id] = movie.rating;
        });
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(ratings));
        console.log('Ratings saved to local storage');
    }

    setupEventListeners() {
        // Search functionality
        document.getElementById('searchBox').addEventListener('input', (e) => {
            this.filterMovies(e.target.value, document.getElementById('filterRating').value);
        });

        // Rating filter
        document.getElementById('filterRating').addEventListener('change', (e) => {
            this.filterMovies(document.getElementById('searchBox').value, e.target.value);
        });

        // Reset ratings button
        document.getElementById('resetRatings').addEventListener('click', () => {
            if (confirm('Are you sure you want to reset all ratings to their original values?')) {
                this.resetRatings();
            }
        });
    }

    filterMovies(searchTerm, ratingFilter) {
        this.filteredMovies = this.movies.filter(movie => {
            const matchesSearch = searchTerm === '' ||
                movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                movie.director.toLowerCase().includes(searchTerm.toLowerCase()) ||
                movie.year.toString().includes(searchTerm);

            const matchesRating = ratingFilter === 'all' ||
                movie.rating === parseInt(ratingFilter);

            return matchesSearch && matchesRating;
        });

        this.renderMovies();
    }

    renderMovies() {
        const grid = document.getElementById('moviesGrid');

        if (this.filteredMovies.length === 0) {
            grid.innerHTML = '<div class="no-results">No movies found matching your criteria.</div>';
            return;
        }

        grid.innerHTML = this.filteredMovies.map(movie => `
            <div class="movie-card">
                <div class="movie-title">${movie.title}</div>
                <div class="movie-info">
                    <div class="movie-year">Year: ${movie.year}</div>
                    <div class="movie-director">Director: ${movie.director}</div>
                </div>
                <div class="rating-container">
                    <div class="stars" data-movie-id="${movie.id}">
                        ${this.renderStars(movie.id, movie.rating)}
                    </div>
                    <span class="rating-text">${movie.rating}/5</span>
                </div>
            </div>
        `).join('');

        // Add click handlers to stars
        document.querySelectorAll('.star').forEach(star => {
            star.addEventListener('click', (e) => {
                const movieId = parseInt(e.target.dataset.movieId);
                const rating = parseInt(e.target.dataset.rating);
                this.updateRating(movieId, rating);
            });
        });

        this.updateStats();
    }

    renderStars(movieId, currentRating) {
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            const filled = i <= currentRating ? 'filled' : '';
            stars += `<span class="star ${filled}" data-movie-id="${movieId}" data-rating="${i}">★</span>`;
        }
        return stars;
    }

    updateRating(movieId, newRating) {
        const movie = this.movies.find(m => m.id === movieId);
        if (movie) {
            movie.rating = newRating;
            this.saveRatingsToStorage();

            // Update the specific movie card instead of re-rendering everything
            const starsContainer = document.querySelector(`[data-movie-id="${movieId}"]`);
            if (starsContainer) {
                starsContainer.innerHTML = this.renderStars(movieId, newRating);
                starsContainer.nextElementSibling.textContent = `${newRating}/5`;

                // Re-attach click handlers to the new stars
                starsContainer.querySelectorAll('.star').forEach(star => {
                    star.addEventListener('click', (e) => {
                        const mid = parseInt(e.target.dataset.movieId);
                        const rating = parseInt(e.target.dataset.rating);
                        this.updateRating(mid, rating);
                    });
                });
            }

            this.updateStats();
        }
    }

    updateStats() {
        const totalMovies = this.movies.length;
        const avgRating = (this.movies.reduce((sum, m) => sum + m.rating, 0) / totalMovies).toFixed(1);

        // Count movies that have been rated (changed from default)
        const storedRatings = localStorage.getItem(this.STORAGE_KEY);
        const ratedCount = storedRatings ? Object.keys(JSON.parse(storedRatings)).length : 0;

        document.getElementById('totalMovies').textContent = totalMovies;
        document.getElementById('avgRating').textContent = avgRating;
        document.getElementById('ratedMovies').textContent = ratedCount;
    }

    async resetRatings() {
        // Clear local storage
        localStorage.removeItem(this.STORAGE_KEY);

        // Reload original ratings from JSON
        await this.loadMovies();

        // Re-render
        this.filterMovies(
            document.getElementById('searchBox').value,
            document.getElementById('filterRating').value
        );

        this.updateStats();

        alert('All ratings have been reset to their original values!');
    }
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const app = new HorrorMoviesApp();
});
