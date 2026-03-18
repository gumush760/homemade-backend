const express  = require('express');
const router   = express.Router();
const { loadFavorites, saveFavorites } = require('../users');
const { authMiddleware } = require('../middleware/auth');
const { load } = require('../db');

// ── GET /api/favorites ────────────────────────────────────────────────────────

router.get('/', authMiddleware, (req, res) => {
  try {
    const favorites = loadFavorites();
    const userFavIds = favorites
      .filter(f => f.userId === req.user.id)
      .map(f => f.recipeId);

    const recipes = load();
    const favRecipes = recipes.filter(r => userFavIds.includes(r.id));

    res.json({ success: true, count: favRecipes.length, recipes: favRecipes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to get favorites' });
  }
});

// ── POST /api/favorites/:id ───────────────────────────────────────────────────

router.post('/:id', authMiddleware, (req, res) => {
  try {
    const recipeId = parseInt(req.params.id);
    const recipes = load();
    const recipe = recipes.find(r => r.id === recipeId);
    if (!recipe) return res.status(404).json({ success: false, error: 'Recipe not found' });

    const favorites = loadFavorites();
    const alreadyFaved = favorites.find(f => f.userId === req.user.id && f.recipeId === recipeId);
    if (alreadyFaved) {
      return res.status(400).json({ success: false, error: 'Already in favorites' });
    }

    favorites.push({ userId: req.user.id, recipeId, createdAt: new Date().toISOString() });
    saveFavorites(favorites);

    res.json({ success: true, message: `"${recipe.name}" added to favorites ❤️` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to add favorite' });
  }
});

// ── DELETE /api/favorites/:id ─────────────────────────────────────────────────

router.delete('/:id', authMiddleware, (req, res) => {
  try {
    const recipeId = parseInt(req.params.id);
    const favorites = loadFavorites();
    const index = favorites.findIndex(f => f.userId === req.user.id && f.recipeId === recipeId);
    if (index === -1) return res.status(404).json({ success: false, error: 'Favorite not found' });

    favorites.splice(index, 1);
    saveFavorites(favorites);

    res.json({ success: true, message: 'Removed from favorites' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to remove favorite' });
  }
});

module.exports = router;
