const express = require('express');
const cors    = require('cors');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── MIDDLEWARE ────────────────────────────────────────────────────────────────

app.use(cors());
app.use(express.json());

// ── SERVE FRONTEND ────────────────────────────────────────────────────────────

const frontendPath = path.join(__dirname, '..', 'Homemade Frontend');
console.log('Serving frontend from:', frontendPath);
app.use(express.static(frontendPath));

// ── ROUTES ────────────────────────────────────────────────────────────────────

app.use('/api/recipes',   require('./routes/recipes'));
app.use('/api/auth',      require('./routes/auth'));
app.use('/api/favorites', require('./routes/favorites'));
app.use('/api/admin',     require('./routes/admin'));

// ── HEALTH CHECK ──────────────────────────────────────────────────────────────

app.get('/api', (req, res) => {
  res.json({
    message: '🍽️ Homemade API is running!',
    version: '2.0.0',
    storage: 'JSON file',
    endpoints: {
      getAllRecipes:     'GET    /api/recipes',
      filterByCategory: 'GET    /api/recipes?category=soup',
      searchRecipes:    'GET    /api/recipes?search=chicken',
      getOneRecipe:     'GET    /api/recipes/:id',
      createRecipe:     'POST   /api/recipes',
      updateRecipe:     'PUT    /api/recipes/:id',
      deleteRecipe:     'DELETE /api/recipes/:id',
    }
  });
});

// ── 404 HANDLER ───────────────────────────────────────────────────────────────

app.use('/api', (req, res) => {
  res.status(404).json({ success: false, error: `Route ${req.method} ${req.path} not found` });
});

// ── ERROR HANDLER ─────────────────────────────────────────────────────────────

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

// ── START ─────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`✅ Homemade API running at http://localhost:${PORT}`);
});
