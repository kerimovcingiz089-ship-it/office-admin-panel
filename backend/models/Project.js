const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema(
  {
    meeting_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Meeting' },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    project_images: [{ type: String }],
    project_pdf: { type: String, trim: true },
    status: { type: String, default: 'new' }
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

module.exports = mongoose.models.Project || mongoose.model('Project', ProjectSchema);


