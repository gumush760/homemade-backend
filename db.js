const fs   = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'recipes.json');

// ── LOAD ──────────────────────────────────────────────────────────────────────

function load() {
  if (!fs.existsSync(DB_PATH)) return [];
  const raw = fs.readFileSync(DB_PATH, 'utf-8');
  return JSON.parse(raw);
}

// ── SAVE ──────────────────────────────────────────────────────────────────────

function save(recipes) {
  fs.writeFileSync(DB_PATH, JSON.stringify(recipes, null, 2), 'utf-8');
}

module.exports = { load, save, DB_PATH };
