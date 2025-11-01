// Horror Movies App with Local Storage
class HorrorMoviesApp {
    constructor() {
        this.movies = [];
        this.filteredMovies = [];
        this.originalRatings = {}; // Store original ratings to identify user changes
        this.STORAGE_KEY = 'horrorMoviesRatings';
        this.WATCHED_STORAGE_KEY = 'horrorMoviesWatched';
        this.init();
    }

    async init() {
        await this.loadMovies();
        this.loadRatingsFromStorage();
        this.loadWatchedStatusFromStorage();
        this.setupEventListeners();
        this.renderMovies();
        this.updateStats();
        this.updateRecommendations();
    }

    async loadMovies() {
        try {
            const response = await fetch('horror-movies.json');
            this.movies = await response.json();
            this.filteredMovies = [...this.movies];

            // Store original ratings and initialize watched status
            this.movies.forEach(movie => {
                this.originalRatings[movie.id] = movie.rating;
                movie.watched = false; // All movies unwatched by default
            });
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

    loadWatchedStatusFromStorage() {
        const stored = localStorage.getItem(this.WATCHED_STORAGE_KEY);
        if (stored) {
            try {
                const watchedStatus = JSON.parse(stored);
                // Apply stored watched status to movies
                this.movies.forEach(movie => {
                    if (watchedStatus[movie.id] !== undefined) {
                        movie.watched = watchedStatus[movie.id];
                    }
                });
                console.log('Watched status loaded from local storage');
            } catch (error) {
                console.error('Error parsing stored watched status:', error);
            }
        }
    }

    saveWatchedStatusToStorage() {
        const watchedStatus = {};
        this.movies.forEach(movie => {
            watchedStatus[movie.id] = movie.watched;
        });
        localStorage.setItem(this.WATCHED_STORAGE_KEY, JSON.stringify(watchedStatus));
        console.log('Watched status saved to local storage');
    }

    toggleWatchedStatus(movieId) {
        const movie = this.movies.find(m => m.id === movieId);
        if (movie) {
            movie.watched = !movie.watched;

            // If marking as unwatched, reset rating to original
            if (!movie.watched) {
                movie.rating = this.originalRatings[movieId];
                this.saveRatingsToStorage();
            }

            this.saveWatchedStatusToStorage();
            this.renderMovies();
            this.updateStats();
            this.updateRecommendations();
        }
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

        // Refresh recommendations button
        document.getElementById('refreshRecommendations').addEventListener('click', () => {
            this.updateRecommendations();
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
            <div class="movie-card ${movie.watched ? 'watched' : 'unwatched'}">
                ${!movie.watched ? '<div class="unwatched-badge">📺 UNWATCHED</div>' : ''}
                <div class="movie-title">${movie.title}</div>
                <div class="movie-info">
                    <div class="movie-year">Year: ${movie.year}</div>
                    <div class="movie-director">Director: ${movie.director}</div>
                </div>
                <div class="rating-container">
                    <div class="stars ${!movie.watched ? 'disabled' : ''}" data-movie-id="${movie.id}">
                        ${this.renderStars(movie.id, movie.rating, movie.watched)}
                    </div>
                    <span class="rating-text">${movie.watched ? movie.rating + '/5' : '-/5'}</span>
                </div>
                <button class="watched-toggle-btn" data-movie-id="${movie.id}">
                    ${movie.watched ? '✓ Watched' : 'Mark as Watched'}
                </button>
            </div>
        `).join('');

        // Add click handlers to stars (only for watched movies)
        document.querySelectorAll('.star').forEach(star => {
            star.addEventListener('click', (e) => {
                const movieId = parseInt(e.target.dataset.movieId);
                const movie = this.movies.find(m => m.id === movieId);

                // Only allow rating if movie is watched
                if (movie && movie.watched) {
                    const rating = parseInt(e.target.dataset.rating);
                    this.updateRating(movieId, rating);
                }
            });
        });

        // Add click handlers to watched toggle buttons
        document.querySelectorAll('.watched-toggle-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const movieId = parseInt(e.target.dataset.movieId);
                this.toggleWatchedStatus(movieId);
            });
        });

        this.updateStats();
    }

    renderStars(movieId, currentRating, watched) {
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            const filled = watched && i <= currentRating ? 'filled' : '';
            stars += `<span class="star ${filled}" data-movie-id="${movieId}" data-rating="${i}">★</span>`;
        }
        return stars;
    }

    updateRating(movieId, newRating) {
        const movie = this.movies.find(m => m.id === movieId);
        if (movie && movie.watched) {  // Only allow rating if watched
            movie.rating = newRating;
            this.saveRatingsToStorage();

            // Update the specific movie card instead of re-rendering everything
            const starsContainer = document.querySelector(`[data-movie-id="${movieId}"]`);
            if (starsContainer) {
                starsContainer.innerHTML = this.renderStars(movieId, newRating, movie.watched);
                starsContainer.nextElementSibling.textContent = `${newRating}/5`;

                // Re-attach click handlers to the new stars
                starsContainer.querySelectorAll('.star').forEach(star => {
                    star.addEventListener('click', (e) => {
                        const mid = parseInt(e.target.dataset.movieId);
                        const m = this.movies.find(movie => movie.id === mid);
                        if (m && m.watched) {
                            const rating = parseInt(e.target.dataset.rating);
                            this.updateRating(mid, rating);
                        }
                    });
                });
            }

            this.updateStats();
            this.updateRecommendations();
        }
    }

    updateStats() {
        const totalMovies = this.movies.length;
        const watchedMovies = this.movies.filter(m => m.watched);
        const watchedCount = watchedMovies.length;
        const unwatchedCount = totalMovies - watchedCount;

        // Calculate average rating only for watched movies
        const avgRating = watchedCount > 0
            ? (watchedMovies.reduce((sum, m) => sum + m.rating, 0) / watchedCount).toFixed(1)
            : '0.0';

        document.getElementById('totalMovies').textContent = totalMovies;
        document.getElementById('watchedMovies').textContent = watchedCount;
        document.getElementById('unwatchedMovies').textContent = unwatchedCount;
        document.getElementById('avgRating').textContent = avgRating;
    }

    async resetRatings() {
        // Clear local storage
        localStorage.removeItem(this.STORAGE_KEY);
        localStorage.removeItem(this.WATCHED_STORAGE_KEY);

        // Reload original ratings from JSON
        await this.loadMovies();

        // Re-render
        this.filterMovies(
            document.getElementById('searchBox').value,
            document.getElementById('filterRating').value
        );

        this.updateStats();
        this.updateRecommendations();

        alert('All ratings and watched status have been reset!');
    }

    getUserRatedMovies() {
        // Get movies that have been watched by the user
        return this.movies.filter(movie => movie.watched);
    }

    getUnwatchedMovies() {
        // Get movies that haven't been watched by the user
        return this.movies.filter(movie => !movie.watched);
    }

    getDecade(year) {
        return Math.floor(year / 10) * 10;
    }

    calculateRecommendations() {
        const watchedMovies = this.getUserRatedMovies();
        const unwatchedMovies = this.getUnwatchedMovies();

        // Need at least 2 watched movies to generate recommendations
        if (watchedMovies.length < 2 || unwatchedMovies.length === 0) {
            return [];
        }

        // Get highly rated movies (4 or 5 stars) from watched movies
        const highlyRated = watchedMovies.filter(m => m.rating >= 4);

        // If no highly rated movies, use all watched movies
        const referenceMovies = highlyRated.length > 0 ? highlyRated : watchedMovies;

        // Calculate average rating of user's watched movies
        const avgUserRating = watchedMovies.reduce((sum, m) => sum + m.rating, 0) / watchedMovies.length;

        // Score each unwatched movie
        const scoredMovies = unwatchedMovies.map(movie => {
            let score = 0;
            const reasons = [];

            // Factor 1: Director match with highly rated movies
            const sameDirectorMovies = referenceMovies.filter(m =>
                m.director.toLowerCase() === movie.director.toLowerCase()
            );
            if (sameDirectorMovies.length > 0) {
                score += 50;
                reasons.push(`Same director as ${sameDirectorMovies[0].title}`);
            }

            // Factor 2: Similar decade to highly rated movies
            const movieDecade = this.getDecade(movie.year);
            const sameDecadeMovies = referenceMovies.filter(m =>
                this.getDecade(m.year) === movieDecade
            );
            if (sameDecadeMovies.length > 0) {
                score += 30;
                reasons.push(`From the ${movieDecade}s era you enjoy`);
            }

            // Factor 3: Original rating similarity
            const originalRating = this.originalRatings[movie.id];
            if (originalRating >= 4 && avgUserRating >= 4) {
                score += 40;
                reasons.push('Critically acclaimed horror classic');
            } else if (originalRating >= 3 && avgUserRating >= 3) {
                score += 20;
                reasons.push('Well-regarded by critics');
            }

            // Factor 4: Proximity in year to favorite movies
            const avgYear = referenceMovies.reduce((sum, m) => sum + m.year, 0) / referenceMovies.length;
            const yearDifference = Math.abs(movie.year - avgYear);
            if (yearDifference <= 5) {
                score += 25;
                reasons.push(`Released around ${Math.round(avgYear)}`);
            } else if (yearDifference <= 10) {
                score += 15;
            }

            // Factor 5: Boost for classics if user likes classics
            const hasClassics = referenceMovies.some(m => m.year < 1980);
            if (hasClassics && movie.year < 1980) {
                score += 20;
                reasons.push('Classic horror film');
            }

            // Factor 6: Boost for modern films if user likes modern horror
            const hasModern = referenceMovies.some(m => m.year >= 2010);
            if (hasModern && movie.year >= 2010) {
                score += 20;
                reasons.push('Modern horror gem');
            }

            return {
                movie,
                score,
                reasons: reasons.length > 0 ? reasons : ['Based on your rating patterns']
            };
        });

        // Sort by score and return top recommendations
        scoredMovies.sort((a, b) => b.score - a.score);
        return scoredMovies.slice(0, 6); // Return top 6 recommendations
    }

    updateRecommendations() {
        const recommendations = this.calculateRecommendations();
        const section = document.getElementById('recommendationsSection');
        const grid = document.getElementById('recommendationsGrid');

        if (recommendations.length === 0) {
            section.classList.add('hidden');
            return;
        }

        section.classList.remove('hidden');

        grid.innerHTML = recommendations.map(({ movie, score, reasons }) => `
            <div class="recommendation-card ${movie.watched ? 'watched' : 'unwatched'}">
                ${!movie.watched ? '<div class="unwatched-badge">📺 UNWATCHED</div>' : ''}
                <div class="movie-title">${movie.title}</div>
                <div class="movie-info">
                    <div class="movie-year">Year: ${movie.year}</div>
                    <div class="movie-director">Director: ${movie.director}</div>
                </div>
                <div class="rating-container">
                    <div class="stars ${!movie.watched ? 'disabled' : ''}" data-movie-id="${movie.id}">
                        ${this.renderStars(movie.id, movie.rating, movie.watched)}
                    </div>
                    <span class="rating-text">${movie.watched ? movie.rating + '/5' : '-/5'}</span>
                </div>
                <div class="recommendation-reason">
                    <strong>Why:</strong> ${reasons.slice(0, 2).join(', ')}
                    <span class="recommendation-score">Match: ${score}%</span>
                </div>
                <button class="watched-toggle-btn" data-movie-id="${movie.id}">
                    ${movie.watched ? '✓ Watched' : 'Mark as Watched'}
                </button>
            </div>
        `).join('');

        // Add click handlers to stars in recommendations
        grid.querySelectorAll('.star').forEach(star => {
            star.addEventListener('click', (e) => {
                const movieId = parseInt(e.target.dataset.movieId);
                const movie = this.movies.find(m => m.id === movieId);

                // Only allow rating if movie is watched
                if (movie && movie.watched) {
                    const rating = parseInt(e.target.dataset.rating);
                    this.updateRating(movieId, rating);
                }
            });
        });

        // Add click handlers to watched toggle buttons in recommendations
        grid.querySelectorAll('.watched-toggle-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const movieId = parseInt(e.target.dataset.movieId);
                this.toggleWatchedStatus(movieId);
            });
        });
    }
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const app = new HorrorMoviesApp();
});
