const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'CustomerUser', required: true },
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },

  // موقع بداية الخدمة (مكان العميل الحالي)
  startLocation: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    address: { type: String, required: true }
  },
  // مكان الوجهة (إذا كان العميل يريد الذهاب إلى مكان آخر – اختياري)
  destination: {
    lat: { type: Number },
    lng: { type: Number },
    address: { type: String }
  },

  problemDescription: { type: String, default: '' },

  // تقديرات
  estimatedDistance: { type: Number, default: 0 },      // km
  estimatedArrivalTime: { type: Number, default: 0 },   // minutes
  estimatedPriceRange: { type: String, default: '' },   // للونش فقط

  serviceType: {
    type: String,
    enum: ['mechanic', 'electrician', 'tire', 'workshop', 'battery', 'fuel', 'towing'],
    required: true
  },

  assignedProviderId: { type: mongoose.Schema.Types.ObjectId, ref: 'ProviderUser' },
  assignedProviderName: { type: String },
  assignedProviderPhone: { type: String },

  // السعر المتفق عليه (للونش فقط)
  agreedPrice: { type: Number },

  status: {
    type: String,
    enum: ['pending', 'accepted', 'on_the_way', 'in_progress', 'completed', 'cancelled', 'timeout', 'rated'],
    default: 'pending'
  },

  // سبب الإلغاء
  cancelReason: { type: String },
  customCancelReason: { type: String },

  // التقييم (بعد completed)
  customerRating: { type: Number, min: 1, max: 5 },
  customerReview: { type: String },
  ratedAt: Date,

  // توقيتات
  createdAt: { type: Date, default: Date.now },
  acceptedAt: Date,
  startedAt: Date,
  completedAt: Date,
  timeoutAt: Date,        // وقت انتهاء مهلة الـ 15 ثانية

  statusHistory: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    note: String
  }]
});

requestSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    this.statusHistory.push({ status: this.status, timestamp: new Date() });
  }
  next();
});

module.exports = mongoose.models.ServiceRequest || mongoose.model('ServiceRequest', requestSchema);