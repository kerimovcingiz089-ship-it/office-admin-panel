const express = require('express');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');

const router = express.Router();

// Simple login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email və şifrə tələb olunur!' });
    }

    // Simple admin user check
    if (email === 'admin@deposist.az' && password === 'admin123') {
      const user = {
        id: 1,
        username: 'admin',
        email: 'admin@deposist.az',
        role: 'admin',
        status: 'active'
      };

      // Generate JWT token including user object for local use
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role, user },
        process.env.JWT_SECRET || 'your_super_secret_jwt_key_here',
        { expiresIn: '24h' }
      );

      res.json({
        message: 'Giriş uğurlu!',
        token,
        user
      });
    } else {
      res.status(401).json({ message: 'Email və ya şifrə yanlışdır!' });
    }

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server xətası baş verdi!' });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    res.json({ user: req.user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server xətası baş verdi!' });
  }
});

module.exports = router;
