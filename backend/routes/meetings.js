const express = require('express');
const Meeting = require('../models/Meeting');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all meetings
router.get('/', auth, async (req, res) => {
  try {
    const meetings = await Meeting.find({}).sort({ created_at: -1 });
    res.json({ meetings });
  } catch (error) {
    console.error('Get meetings error:', error);
    res.status(500).json({ message: 'Server xətası baş verdi!' });
  }
});

module.exports = router;
