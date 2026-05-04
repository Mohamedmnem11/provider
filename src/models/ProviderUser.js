const mongoose = require('mongoose');

const providerUserSchema = new mongoose.Schema({
  // البيانات الأساسية
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  
  // الرقم القومي للتحقق
  nationalId: { type: String, unique: true, sparse: true },
  
  // صور البطاقة
  idCardFront: { type: String },
  idCardBack: { type: String },
  selfie: { type: String },
  
  // التخصصات
  specialties: [{
    type: String,
    enum: ['mechanic', 'electrician', 'tire', 'workshop', 'battery', 'fuel']
  }],
  
  // ✅ الموقع الجغرافي - أصبح اختيارياً (ليس required)
  location: {
    lat: { type: Number },     // من غير required: true
    lng: { type: Number },     // من غير required: true
    address: { type: String }  // من غير required: true
  },
  
  // نطاق الخدمة بالكيلومترات
  serviceRange: { type: Number, default: 20 },
  
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
  price: { type: Number, default: 150 },
  
  // التقييم
  rating: { type: Number, default: 0 },
  totalRatings: { type: Number, default: 0 },
  
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.ProviderUser || mongoose.model('ProviderUser', providerUserSchema);