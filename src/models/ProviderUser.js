const mongoose = require('mongoose');

const providerUserSchema = new mongoose.Schema({
  // البيانات الأساسية
  name: { type: String, default: '' },
  phone: { type: String, required: true, unique: true },
  
  // الرقم القومي للتحقق
  nationalId: { type: String, unique: true, sparse: true },
  
  // صور البطاقة الشخصية
  idCardFront: { type: String },
  idCardBack: { type: String },
  selfie: { type: String },
  
  // رخصة الونش
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
  
  // نطاق الخدمة بالكيلومترات
  serviceRange: { type: Number, default: 20 },
  
  // الأسعار حسب التخصص
  towingPrice: { type: Number, default: 0 },
  mechanicPrice: { type: Number, default: 150 },
  electricianPrice: { type: Number, default: 150 },
  tirePrice: { type: Number, default: 100 },
  workshopPrice: { type: Number, default: 200 },
  batteryPrice: { type: Number, default: 300 },
  fuelPrice: { type: Number, default: 100 },
  
  // نظام الاشتراك
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
  
  // حالة الحساب
  isPhoneVerified: { type: Boolean, default: false },
  isProfileComplete: { type: Boolean, default: false },
  isApproved: { type: Boolean, default: false },
  rejectionReason: { type: String },
  
  // حالة التوفر
  isOnline: { type: Boolean, default: false },
  lastSeen: { type: Date, default: Date.now },
  
  // معلومات المهنة
  experience: { type: Number, default: 0 },
  bio: { type: String },
  
  // التقييم
  rating: { type: Number, default: 0 },
  totalRatings: { type: Number, default: 0 },
  
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.ProviderUser || mongoose.model('ProviderUser', providerUserSchema);