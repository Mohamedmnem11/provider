const mongoose = require('mongoose');

const providerUserSchema = new mongoose.Schema({
  name: { type: String, default: '' },
  phone: { type: String, required: true, unique: true },

  // صور البطاقة
  idCardFront: { type: String },
  idCardBack: { type: String },
  selfie: { type: String },
  towLicenseFront: { type: String },
  towLicenseBack: { type: String },

  // التخصصات
  specialties: [{
    type: String,
    enum: ['mechanic', 'electrician', 'tire', 'workshop', 'battery', 'fuel', 'towing']
  }],

  // الموقع الجغرافي
  location: {
    lat: { type: Number },
    lng: { type: Number },
    address: { type: String }
  },
  serviceRange: { type: Number, default: 20 },

  // الأسعار – فقط للونش
  towingPrice: { type: Number, default: 0 },

  // الاشتراك
  subscriptionStatus: {
    type: String,
    enum: ['active', 'expired', 'cancelled', 'pending'],
    default: 'pending'
  },
  subscriptionPlan: {
    type: String,
    enum: ['basic', 'premium', 'professional', null],
    default: null
  },
  subscriptionEndDate: { type: Date },
  subscriptionStartDate: { type: Date },

  isPhoneVerified: { type: Boolean, default: false },
  isProfileComplete: { type: Boolean, default: false },
  isApproved: { type: Boolean, default: false },
  rejectionReason: { type: String },

  isOnline: { type: Boolean, default: false },
  lastSeen: { type: Date, default: Date.now },

  experience: { type: Number, default: 0 },
  bio: { type: String },

  rating: { type: Number, default: 0 },
  totalRatings: { type: Number, default: 0 },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.ProviderUser || mongoose.model('ProviderUser', providerUserSchema);