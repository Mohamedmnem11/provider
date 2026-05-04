const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  customerId: { type: String, required: true },     // ID العميل من نظام العملاء
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  customerLocation: {
    lat: Number,
    lng: Number,
    address: String
  },
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'ProviderService', required: true },
  serviceName: { type: String, required: true },
  providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'ProviderUser', required: true },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'on_the_way', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  searchRadius: { type: Number, default: 20 } ,
  notes: { type: String },
  price: { type: Number },
  startedAt: Date,
  completedAt: Date,
  customerRating: { type: Number, min: 1, max: 5 },
  customerReview: String
}, { timestamps: true });

module.exports = mongoose.model('ProviderRequest', requestSchema);