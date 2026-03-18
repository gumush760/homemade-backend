const express = require('express');
const router  = express.Router();
const { loadUsers } = require('../users');
const { load } = require('../db');
const { loadFavorites } = require('../users');

// ── ADMIN AUTH MIDDLEWARE ─────────────────────────────────────────────────────

function adminAuth(req, res, next) {
  const password = req.headers['x-admin-password'];
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'changeme';

  if (!password || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, error: 'Invalid admin password' });
  }
  next();
}

// ── GET /api/admin/stats ──────────────────────────────────────────────────────

router.get('/stats', adminAuth, (req, res) => {
  try {
    const users     = loadUsers();
    const recipes   = load();
    const favorites = loadFavorites();

    res.json({
      success: true,
      stats: {
        totalUsers:     users.length,
        totalRecipes:   recipes.length,
        totalFavorites: favorites.length,
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to get stats' });
  }
});

// ── GET /api/admin/users ──────────────────────────────────────────────────────

router.get('/users', adminAuth, (req, res) => {
  try {
    const users     = loadUsers();
    const favorites = loadFavorites();

    const safeUsers = users.map(u => ({
      id:        u.id,
      name:      u.name,
      email:     u.email,
      role:      u.role,
      createdAt: u.createdAt,
      favorites: favorites.filter(f => f.userId === u.id).length,
    }));

    res.json({ success: true, count: safeUsers.length, users: safeUsers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to get users' });
  }
});

// ── DELETE /api/admin/users/:id ───────────────────────────────────────────────

router.delete('/users/:id', adminAuth, (req, res) => {
  try {
    const { loadUsers, saveUsers, loadFavorites, saveFavorites } = require('../users');
    const users = loadUsers();
    const index = users.findIndex(u => u.id === parseInt(req.params.id));
    if (index === -1) return res.status(404).json({ success: false, error: 'User not found' });

    const deleted = users.splice(index, 1)[0];
    saveUsers(users);

    const favorites = loadFavorites();
    saveFavorites(favorites.filter(f => f.userId !== parseInt(req.params.id)));

    res.json({ success: true, message: `User "${deleted.name}" deleted` });
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
    const { load, save } = require('../db');
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
    const { load, save } = require('../db');
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
