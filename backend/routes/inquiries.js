const express = require('express');
const Inquiry = require('../models/Inquiry');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all inquiries
router.get('/', auth, async (req, res) => {
  try {
    const inquiries = await Inquiry.find({}).sort({ created_at: -1 });
    res.json({ inquiries });
  } catch (error) {
    console.error('Get inquiries error:', error);
    res.status(500).json({ message: 'Server xətası baş verdi!' });
  }
});

module.exports = router;
