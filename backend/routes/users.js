const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all users
router.get('/', auth, async (req, res) => {
  try {
    const users = await User.find({}, {
      name: 1,
      email: 1,
      department: 1,
      position: 1,
      status: 1,
      role_id: 1,
      join_date: 1
    }).sort({ _id: -1 });

    res.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server xətası baş verdi!' });
  }
});

// Get user by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('name email department position status role_id join_date');

    if (!user) {
      return res.status(404).json({ message: 'İstifadəçi tapılmadı!' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server xətası baş verdi!' });
  }
});

// Create new user
router.post('/', auth, async (req, res) => {
  try {
    const { name, email, password, department, position, role_id, status } = req.body;

    if (!name || !email || !password || !department || !position) {
      return res.status(400).json({ message: 'Bütün məcburi sahələr doldurulmalıdır!' });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Bu email artıq istifadə olunub!' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user
    const created = await User.create({
      name,
      email,
      password: hashedPassword,
      department,
      position,
      role_id: role_id || null,
      status: status || 'active'
    });

    const user = await User.findById(created._id).select('name email department position status role_id join_date');

    res.status(201).json({ message: 'İstifadəçi uğurla yaradıldı!', user });

  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Server xətası baş verdi!' });
  }
});

// Update user
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, email, department, position, role_id, status } = req.body;
    const userId = req.params.id;

    if (!name || !email || !department || !position) {
      return res.status(400).json({ message: 'Bütün məcburi sahələr doldurulmalıdır!' });
    }

    // Check if email exists for other users
    const existingUser = await User.findOne({ email, _id: { $ne: userId } });
    if (existingUser) {
      return res.status(400).json({ message: 'Bu email artıq istifadə olunub!' });
    }

    // Update user
    await User.updateOne(
      { _id: userId },
      {
        $set: {
          name,
          email,
          department,
          position,
          role_id: role_id || null,
          status: status || 'active'
        }
      }
    );

    const user = await User.findById(userId).select('name email department position status role_id join_date');

    res.json({ message: 'İstifadəçi uğurla yeniləndi!', user });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server xətası baş verdi!' });
  }
});

// Delete user
router.delete('/:id', auth, async (req, res) => {
  try {
    const userId = req.params.id;

    const existingUser = await User.findById(userId).select('_id');
    if (!existingUser) {
      return res.status(404).json({ message: 'İstifadəçi tapılmadı!' });
    }

    await User.deleteOne({ _id: userId });

    res.json({ message: 'İstifadəçi uğurla silindi!' });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server xətası baş verdi!' });
  }
});

module.exports = router;
