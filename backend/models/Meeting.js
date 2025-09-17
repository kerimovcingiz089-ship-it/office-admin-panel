const mongoose = require('mongoose');

const MeetingSchema = new mongoose.Schema(
  {
    inquiry_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Inquiry' },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    location: { type: String, trim: true },
    images: [{ type: String }],
    notes: { type: String, trim: true },
    status: { type: String, default: 'pending' },
    meeting_date: { type: Date }
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

module.exports = mongoose.models.Meeting || mongoose.model('Meeting', MeetingSchema);


