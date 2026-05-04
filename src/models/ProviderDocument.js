const mongoose = require('mongoose');

const providerDocumentSchema = new mongoose.Schema({
  providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'ProviderUser', required: true, unique: true },
  
  // مسارات الصور من Cloudinary
  nationalIdFront: { type: String, required: true },
  nationalIdBack: { type: String, required: true },
  selfie: { type: String, required: true },
  
  // البيانات المستخرجة من الرقم القومي
  extractedData: {
    birthDate: String,
    gender: String
  },
  
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  reviewNotes: String,
  reviewedAt: Date,
  reviewedBy: String,
  
  uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.ProviderDocument || mongoose.model('ProviderDocument', providerDocumentSchema);