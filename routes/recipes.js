const express = require('express');
const router  = express.Router();
const { load, save } = require('../db');

// ── GET /api/recipes ──────────────────────────────────────────────────────────

router.get('/', (req, res) => {
  try {
    const { category, search } = req.query;
    let recipes = load();

    if (category) {
      recipes = recipes.filter(r => r.category.includes(category));
    } else if (search) {
      const term = search.toLowerCase();
      recipes = recipes.filter(r =>
        r.name.toLowerCase().includes(term) ||
        r.keywords.some(k => k.includes(term)) ||
        r.category.some(c => c.includes(term)) ||
        r.ingredients.some(i => i.toLowerCase().includes(term))
      );
    }

    res.json({ success: true, count: recipes.length, recipes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to fetch recipes' });
  }
});

// ── GET /api/recipes/:id ──────────────────────────────────────────────────────

router.get('/:id', (req, res) => {
  try {
    const recipes = load();
    const recipe = recipes.find(r => r.id === parseInt(req.params.id));
    if (!recipe) return res.status(404).json({ success: false, error: 'Recipe not found' });
    res.json({ success: true, recipe });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to fetch recipe' });
  }
});

// ── POST /api/recipes ─────────────────────────────────────────────────────────

router.post('/', (req, res) => {
  try {
    const { name, emoji, bg, time, badge, badgeClass, category, keywords, ingredients, steps } = req.body;
    if (!name || !time) return res.status(400).json({ success: false, error: 'name and time are required' });

    const recipes = load();
    const newId = recipes.length > 0 ? Math.max(...recipes.map(r => r.id)) + 1 : 1;

    const newRecipe = {
      id: newId,
      name,
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

// ── PUT /api/recipes/:id ──────────────────────────────────────────────────────

router.put('/:id', (req, res) => {
  try {
    const recipes = load();
    const index = recipes.findIndex(r => r.id === parseInt(req.params.id));
    if (index === -1) return res.status(404).json({ success: false, error: 'Recipe not found' });

    recipes[index] = { ...recipes[index], ...req.body, id: recipes[index].id };
    save(recipes);
    res.json({ success: true, recipe: recipes[index] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to update recipe' });
  }
});

// ── DELETE /api/recipes/:id ───────────────────────────────────────────────────

router.delete('/:id', (req, res) => {
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
