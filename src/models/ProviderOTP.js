const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  phone: { type: String, required: true },
  code: { type: String, required: true },
  expiresAt: { type: Date, required: true, default: () => Date.now() + 10 * 60 * 1000 } // 10 دقائق
});

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.models.ProviderOTP || mongoose.model('ProviderOTP', otpSchema);