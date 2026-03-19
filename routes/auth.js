const express  = require('express');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const router   = express.Router();
const supabase = require('../supabase');
const { authMiddleware, JWT_SECRET } = require('../middleware/auth');

// ── POST /api/auth/register ───────────────────────────────────────────────────

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ success: false, error: 'Name, email and password are required' });
    if (password.length < 6)
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });

    const { data: existing } = await supabase.from('users').select('id').eq('email', email.toLowerCase()).single();
    if (existing) return res.status(400).json({ success: false, error: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const { data: newUser, error } = await supabase.from('users')
      .insert({ name, email: email.toLowerCase(), password: hashedPassword, role: 'user' })
      .select().single();

    if (error) throw error;

    const token = jwt.sign({ id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ success: true, token, user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role } });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Registration failed' });
  }
});

// ── POST /api/auth/login ──────────────────────────────────────────────────────

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, error: 'Email and password are required' });

    const { data: user } = await supabase.from('users').select('*').eq('email', email.toLowerCase()).single();
    if (!user) return res.status(401).json({ success: false, error: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ success: false, error: 'Invalid email or password' });

    const token = jwt.sign({ id: user.id, email: user.email, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Login failed' });
  }
});

// ── GET /api/auth/me ──────────────────────────────────────────────────────────

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const { data: user } = await supabase.from('users').select('id, name, email, role, created_at').eq('id', req.user.id).single();
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    res.json({ success: true, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to get user' });
  }
});

module.exports = router;
