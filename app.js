// Horror Movies App with Local Storage
class HorrorMoviesApp {
    constructor() {
        this.movies = [];
        this.filteredMovies = [];
        this.originalRatings = {}; // Store original ratings to identify user changes
        this.STORAGE_KEY = 'horrorMoviesRatings';
        this.init();
    }

    async init() {
        await this.loadMovies();
        this.loadRatingsFromStorage();
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

            // Store original ratings
            this.movies.forEach(movie => {
                this.originalRatings[movie.id] = movie.rating;
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
            this.updateRecommendations();
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
        this.updateRecommendations();

        alert('All ratings have been reset to their original values!');
    }

    getUserRatedMovies() {
        // Get movies that have been rated by the user (different from original rating)
        const storedRatings = localStorage.getItem(this.STORAGE_KEY);
        if (!storedRatings) return [];

        const ratings = JSON.parse(storedRatings);
        return this.movies.filter(movie => ratings[movie.id] !== undefined);
    }

    getUnratedMovies() {
        // Get movies that haven't been rated by the user
        const storedRatings = localStorage.getItem(this.STORAGE_KEY);
        if (!storedRatings) return [...this.movies];

        const ratings = JSON.parse(storedRatings);
        return this.movies.filter(movie => ratings[movie.id] === undefined);
    }

    getDecade(year) {
        return Math.floor(year / 10) * 10;
    }

    calculateRecommendations() {
        const userRatedMovies = this.getUserRatedMovies();
        const unratedMovies = this.getUnratedMovies();

        // Need at least 2 ratings to generate recommendations
        if (userRatedMovies.length < 2 || unratedMovies.length === 0) {
            return [];
        }

        // Get highly rated movies (4 or 5 stars) from user ratings
        const highlyRated = userRatedMovies.filter(m => m.rating >= 4);

        // If no highly rated movies, use all user-rated movies
        const referenceMovies = highlyRated.length > 0 ? highlyRated : userRatedMovies;

        // Calculate average rating of user's rated movies
        const avgUserRating = userRatedMovies.reduce((sum, m) => sum + m.rating, 0) / userRatedMovies.length;

        // Score each unrated movie
        const scoredMovies = unratedMovies.map(movie => {
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
            <div class="recommendation-card">
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
                <div class="recommendation-reason">
                    <strong>Why:</strong> ${reasons.slice(0, 2).join(', ')}
                    <span class="recommendation-score">Match: ${score}%</span>
                </div>
            </div>
        `).join('');

        // Add click handlers to stars in recommendations
        grid.querySelectorAll('.star').forEach(star => {
            star.addEventListener('click', (e) => {
                const movieId = parseInt(e.target.dataset.movieId);
                const rating = parseInt(e.target.dataset.rating);
                this.updateRating(movieId, rating);
            });
        });
    }
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const app = new HorrorMoviesApp();
});
