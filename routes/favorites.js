const express  = require('express');
const router   = express.Router();
const supabase = require('../supabase');
const { authMiddleware } = require('../middleware/auth');
const { load } = require('../db');

// ── GET /api/favorites ────────────────────────────────────────────────────────

router.get('/', authMiddleware, async (req, res) => {
  try {
    const { data: favs } = await supabase.from('favorites').select('recipe_id').eq('user_id', req.user.id);
    const recipeIds = favs.map(f => f.recipe_id);
    const recipes = load().filter(r => recipeIds.includes(r.id));
    res.json({ success: true, count: recipes.length, recipes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to get favorites' });
  }
});

// ── POST /api/favorites/:id ───────────────────────────────────────────────────

router.post('/:id', authMiddleware, async (req, res) => {
  try {
    const recipeId = parseInt(req.params.id);
    const recipe = load().find(r => r.id === recipeId);
    if (!recipe) return res.status(404).json({ success: false, error: 'Recipe not found' });

    const { error } = await supabase.from('favorites').insert({ user_id: req.user.id, recipe_id: recipeId });
    if (error) return res.status(400).json({ success: false, error: 'Already in favorites' });

    res.json({ success: true, message: `"${recipe.name}" added to favorites ❤️` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to add favorite' });
  }
});

// ── DELETE /api/favorites/:id ─────────────────────────────────────────────────

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const recipeId = parseInt(req.params.id);
    const { error } = await supabase.from('favorites').delete().eq('user_id', req.user.id).eq('recipe_id', recipeId);
    if (error) throw error;
    res.json({ success: true, message: 'Removed from favorites' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to remove favorite' });
  }
});

module.exports = router;
