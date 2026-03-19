const express  = require('express');
const router   = express.Router();
const supabase = require('../supabase');
const { load, save } = require('../db');

// ── ADMIN AUTH MIDDLEWARE ─────────────────────────────────────────────────────

function adminAuth(req, res, next) {
  const password = req.headers['x-admin-password'];
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'changeme';
  if (!password || password !== ADMIN_PASSWORD)
    return res.status(401).json({ success: false, error: 'Invalid admin password' });
  next();
}

// ── GET /api/admin/stats ──────────────────────────────────────────────────────

router.get('/stats', adminAuth, async (req, res) => {
  try {
    const { count: totalUsers }     = await supabase.from('users').select('*', { count: 'exact', head: true });
    const { count: totalFavorites } = await supabase.from('favorites').select('*', { count: 'exact', head: true });
    const totalRecipes = load().length;

    res.json({ success: true, stats: { totalUsers, totalRecipes, totalFavorites } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to get stats' });
  }
});

// ── GET /api/admin/users ──────────────────────────────────────────────────────

router.get('/users', adminAuth, async (req, res) => {
  try {
    const { data: users } = await supabase.from('users').select('id, name, email, role, created_at').order('created_at', { ascending: false });
    const { data: favs  } = await supabase.from('favorites').select('user_id');

    const safeUsers = users.map(u => ({
      ...u,
      favorites: favs.filter(f => f.user_id === u.id).length
    }));

    res.json({ success: true, count: safeUsers.length, users: safeUsers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to get users' });
  }
});

// ── DELETE /api/admin/users/:id ───────────────────────────────────────────────

router.delete('/users/:id', adminAuth, async (req, res) => {
  try {
    const { data: user } = await supabase.from('users').select('name').eq('id', req.params.id).single();
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    await supabase.from('favorites').delete().eq('user_id', req.params.id);
    await supabase.from('users').delete().eq('id', req.params.id);

    res.json({ success: true, message: `User "${user.name}" deleted` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to delete user' });
  }
});

// ── GET /api/admin/recipes ────────────────────────────────────────────────────

router.get('/recipes', adminAuth, (req, res) => {
  try {
    const recipes = load();
    res.json({ success: true, count: recipes.length, recipes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to get recipes' });
  }
});

// ── POST /api/admin/recipes ───────────────────────────────────────────────────

router.post('/recipes', adminAuth, (req, res) => {
  try {
    const { name, emoji, bg, time, badge, badgeClass, category, keywords, ingredients, steps } = req.body;
    if (!name || !time) return res.status(400).json({ success: false, error: 'name and time are required' });

    const recipes = load();
    const newId = recipes.length > 0 ? Math.max(...recipes.map(r => r.id)) + 1 : 1;
    const newRecipe = {
      id: newId, name,
      emoji:       emoji       || '🍽️',
      bg:          bg          || 'bg1',
      time,
      badge:       badge       || '',
      badgeClass:  badgeClass  || '',
      category:    category    || [],
      keywords:    keywords    || [],
      ingredients: ingredients || [],
      steps:       steps       || [],
      createdAt:   new Date().toISOString(),
    };

    recipes.push(newRecipe);
    save(recipes);
    res.status(201).json({ success: true, recipe: newRecipe });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to create recipe' });
  }
});

// ── DELETE /api/admin/recipes/:id ─────────────────────────────────────────────

router.delete('/recipes/:id', adminAuth, (req, res) => {
  try {
    const recipes = load();
    const index = recipes.findIndex(r => r.id === parseInt(req.params.id));
    if (index === -1) return res.status(404).json({ success: false, error: 'Recipe not found' });

    const deleted = recipes.splice(index, 1)[0];
    save(recipes);
    res.json({ success: true, message: `Recipe "${deleted.name}" deleted` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to delete recipe' });
  }
});

module.exports = router;
