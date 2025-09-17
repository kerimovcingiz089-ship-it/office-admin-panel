const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    department: { type: String, required: true, trim: true },
    position: { type: String, required: true, trim: true },
    role_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Role', default: null },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    join_date: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

// Ensure unique index on email
UserSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);



