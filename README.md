# Homemade — Backend API

Node.js + Express + SQLite backend for the Homemade recipe manager.

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Seed the database with all 51 recipes
npm run seed

# 3. Start the server
npm start

# Development mode (auto-restarts on file change)
npm run dev
```

Server runs at: `http://localhost:3000`

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/recipes` | Get all recipes |
| GET | `/api/recipes?category=soup` | Filter by category |
| GET | `/api/recipes?search=chicken` | Search recipes |
| GET | `/api/recipes/:id` | Get a single recipe |
| POST | `/api/recipes` | Add a new recipe |
| PUT | `/api/recipes/:id` | Update a recipe |
| DELETE | `/api/recipes/:id` | Delete a recipe |

---

## Example Requests

### Get all recipes
```
GET http://localhost:3000/api/recipes
```

### Filter by category
```
GET http://localhost:3000/api/recipes?category=soup
GET http://localhost:3000/api/recipes?category=vegan
GET http://localhost:3000/api/recipes?category=quick
```

### Search recipes
```
GET http://localhost:3000/api/recipes?search=chicken
GET http://localhost:3000/api/recipes?search=pasta
```

### Get single recipe
```
GET http://localhost:3000/api/recipes/1
```

### Add a new recipe (POST)
```json
POST http://localhost:3000/api/recipes
Content-Type: application/json

{
  "name": "Spaghetti Carbonara",
  "emoji": "🍝",
  "bg": "bg2",
  "time": "25 min",
  "badge": "Classic",
  "badgeClass": "",
  "category": ["main"],
  "keywords": ["pasta", "egg", "bacon", "italian"],
  "ingredients": ["300g spaghetti", "150g pancetta", "3 eggs", "50g Parmesan", "Black pepper"],
  "steps": ["Cook pasta.", "Fry pancetta.", "Mix eggs and Parmesan.", "Combine off heat."]
}
```

---

## Available Categories
`soup` `main` `salad` `dessert` `breakfast` `snack` `beverage` `vegan` `appetizer` `quick`

---

## Project Structure
```
homemade-backend/
├── server.js        ← Express entry point (port 3000)
├── database.js      ← SQLite connection & table setup
├── routes/
│   └── recipes.js   ← All recipe API routes
├── data/
│   └── seed.js      ← Populates DB with 51 recipes
├── homemade.db      ← SQLite database (auto-created)
└── package.json
```
