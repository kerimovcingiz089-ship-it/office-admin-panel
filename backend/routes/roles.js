const express = require('express');
const Role = require('../models/Role');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all roles
router.get('/', auth, async (req, res) => {
  try {
    const roles = await Role.find({}).sort({ created_at: 1 });
    res.json({ roles });
  } catch (error) {
    console.error('Get roles error:', error);
    res.status(500).json({ message: 'Server xətası baş verdi!' });
  }
});

module.exports = router;
