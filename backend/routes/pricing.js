const express = require('express');
const Pricing = require('../models/Pricing');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all pricing
router.get('/', auth, async (req, res) => {
  try {
    const pricing = await Pricing.find({}).sort({ created_at: -1 });
    res.json({ pricing });
  } catch (error) {
    console.error('Get pricing error:', error);
    res.status(500).json({ message: 'Server xətası baş verdi!' });
  }
});

module.exports = router;
