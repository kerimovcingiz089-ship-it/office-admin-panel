const mongoose = require('mongoose');

const InquirySchema = new mongoose.Schema(
  {
    first_name: { type: String, required: true, trim: true },
    last_name: { type: String, required: true, trim: true },
    company_name: { type: String, trim: true },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    status: { type: String, default: 'new', trim: true }
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

module.exports = mongoose.models.Inquiry || mongoose.model('Inquiry', InquirySchema);


