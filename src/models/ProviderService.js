const mongoose = require('mongoose');

const providerServiceSchema = new mongoose.Schema({
  providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'ProviderUser', required: true },
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  category: {
    type: String,
    enum: ['mechanic', 'electrician', 'tire', 'workshop', 'battery', 'fuel', 'towing'],
    required: true
  },
  estimatedTime: { type: Number, default: 30 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.models.ProviderService || mongoose.model('ProviderService', providerServiceSchema);