const mongoose = require('mongoose');

const PricingSchema = new mongoose.Schema(
  {
    project_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    price: { type: Number },
    weight_kg: { type: Number },
    price_offer_pdf: { type: String, trim: true },
    notes: { type: String, trim: true },
    status: { type: String, default: 'draft' }
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

module.exports = mongoose.models.Pricing || mongoose.model('Pricing', PricingSchema);


