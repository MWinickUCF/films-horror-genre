# Horror Movies Collection 🎬

A web-based horror movie catalog featuring 100 classic and modern horror films with a rating system that uses browser local storage to persist your ratings.

## Features

- **100 Horror Movies**: Curated collection spanning from 1920s classics to modern horror
- **Interactive Rating System**: Click stars to rate each movie from 1-5 stars
- **Local Storage Persistence**: Your ratings are automatically saved in your browser's local storage
- **Search Functionality**: Search by movie title, director, or year
- **Filter by Rating**: Filter movies by their star rating
- **Statistics Dashboard**: View total movies, average rating, and number of rated movies
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Files Included

- `horror-movies.json` - JSON database with 100 horror movies
- `index.html` - Main HTML interface
- `app.js` - JavaScript application with local storage integration
- `README.md` - This file

## How to Use

### Opening the Application

1. Open `index.html` in any modern web browser (Chrome, Firefox, Safari, Edge)
2. The application will automatically load all 100 movies from the JSON file

### Rating Movies

1. Each movie card displays stars at the bottom
2. Click on a star (1-5) to set your rating for that movie
3. Your rating is automatically saved to browser local storage
4. The rating persists even after closing and reopening the browser

### Searching and Filtering

- **Search Box**: Type to search by movie title, director, or year
- **Rating Filter**: Select a star rating to show only movies with that rating
- Use both together for precise filtering

### Managing Ratings

- **View Your Ratings**: The "Your Ratings" stat shows how many movies you've rated
- **Reset Ratings**: Click "Reset All Ratings" to restore all movies to their original ratings
- Ratings are stored locally in your browser and won't sync across devices

## Local Storage Details

### How Ratings are Stored

The application uses browser local storage with the key `horrorMoviesRatings`. Ratings are stored as a JSON object:

```javascript
{
  "1": 5,  // Movie ID: Rating
  "2": 4,
  "3": 5,
  ...
}
```

### Viewing Stored Data

You can view your stored ratings in the browser console:

```javascript
localStorage.getItem('horrorMoviesRatings')
```

### Clearing Stored Data

To manually clear all ratings from local storage:

```javascript
localStorage.removeItem('horrorMoviesRatings')
```

Or use the "Reset All Ratings" button in the interface.

## Movie Data Structure

Each movie in `horror-movies.json` has the following structure:

```json
{
  "id": 1,
  "title": "The Exorcist",
  "year": 1973,
  "rating": 5,
  "director": "William Friedkin"
}
```

## Browser Compatibility

- Chrome 4+
- Firefox 3.5+
- Safari 4+
- Edge (all versions)
- Opera 10.5+

All modern browsers support local storage with a typical storage limit of 5-10MB.

## Customization

### Adding More Movies

1. Open `horror-movies.json`
2. Add new movie objects following the existing structure
3. Ensure each movie has a unique `id`
4. Reload the page

### Modifying Styles

- Edit the `<style>` section in `index.html`
- Main colors: Red (#ff4444), Gold (#ffd700), Dark backgrounds

### Changing Storage Key

In `app.js`, modify the `STORAGE_KEY` property:

```javascript
this.STORAGE_KEY = 'yourCustomKey';
```

## Technical Notes

- The app uses vanilla JavaScript (no frameworks required)
- Fetch API is used to load the JSON file
- Event delegation for efficient star rating handlers
- Real-time statistics calculation
- Defensive error handling for JSON parsing

## Troubleshooting

### Movies Not Loading

- Ensure all three files are in the same directory
- Check browser console for errors
- Try running from a local web server if file:// protocol causes issues

### Ratings Not Saving

- Check if local storage is enabled in your browser
- Ensure you're not in private/incognito mode
- Check browser storage quota

### Running from File System

Some browsers may block fetch requests from file:// URLs. To run locally:

```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Node.js (if you have http-server installed)
npx http-server

# PHP
php -S localhost:8000
```

Then visit `http://localhost:8000` in your browser.

## Future Enhancements

Potential features to add:
- Export/import ratings as JSON
- Sort by title, year, or rating
- Dark/light theme toggle
- Movie details modal
- Personal notes for each movie
- Watch list functionality
- Integration with movie APIs for posters

## License

This is a demonstration project. Movie data is for educational purposes.

## Credits

Created as a horror movie catalog with local storage integration for rating persistence.

---

Enjoy exploring the world of horror cinema! 🎃👻🔪
