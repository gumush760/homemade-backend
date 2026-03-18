const fs   = require('fs');
const path = require('path');

const USERS_PATH     = path.join(__dirname, 'users.json');
const FAVORITES_PATH = path.join(__dirname, 'favorites.json');

// ── USERS ─────────────────────────────────────────────────────────────────────

function loadUsers() {
  if (!fs.existsSync(USERS_PATH)) return [];
  return JSON.parse(fs.readFileSync(USERS_PATH, 'utf-8'));
}

function saveUsers(users) {
  fs.writeFileSync(USERS_PATH, JSON.stringify(users, null, 2), 'utf-8');
}

// ── FAVORITES ─────────────────────────────────────────────────────────────────

function loadFavorites() {
  if (!fs.existsSync(FAVORITES_PATH)) return [];
  return JSON.parse(fs.readFileSync(FAVORITES_PATH, 'utf-8'));
}

function saveFavorites(favorites) {
  fs.writeFileSync(FAVORITES_PATH, JSON.stringify(favorites, null, 2), 'utf-8');
}

module.exports = { loadUsers, saveUsers, loadFavorites, saveFavorites };
