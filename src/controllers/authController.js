const ProviderUser = require('../models/ProviderUser');
const ProviderOTP = require('../models/ProviderOTP');
const generateOTP = require('../utils/generateOTP');
const sendOTP = require('../config/sms');
const jwt = require('jsonwebtoken');

// ========== 1. إرسال OTP (للتسجيل أو تسجيل الدخول) ==========
exports.sendOTP = async (req, res) => {
  try {
    const { phone } = req.body;
    
    if (!phone || !/^01[0-9]{9}$/.test(phone)) {
      return res.status(400).json({ message: 'Valid Egyptian phone number is required' });
    }
    
    const code = generateOTP();
    await ProviderOTP.deleteMany({ phone });
    await ProviderOTP.create({ phone, code });
    await sendOTP(phone, code);
    
    res.json({ message: 'OTP sent successfully', phone });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ========== 2. التحقق من OTP + تسجيل الدخول/إنشاء حساب ==========
exports.verifyOTP = async (req, res) => {
  try {
    const { phone, code, name } = req.body;
    
    const otpRecord = await ProviderOTP.findOne({ phone, code });
    if (!otpRecord || otpRecord.expiresAt < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }
    
    let user = await ProviderUser.findOne({ phone });
    let isNewUser = false;
    
    if (!user) {
      if (!name) {
        return res.status(400).json({ message: 'Name is required for first time registration' });
      }
      user = new ProviderUser({ name, phone });
      await user.save();
      isNewUser = true;
    }
    
    user.isPhoneVerified = true;
    await user.save();
    await ProviderOTP.deleteOne({ _id: otpRecord._id });
    
    const token = jwt.sign(
      { id: user._id, phone: user.phone, role: 'provider' },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );
    
    res.json({
      message: isNewUser ? 'Account created successfully' : 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        isProfileComplete: user.isProfileComplete,
        isApproved: user.isApproved
      },
      isNewUser
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ========== 3. إكمال الملف الشخصي (رفع الصور + الموقع + التخصصات) ==========
exports.completeProfile = async (req, res) => {
  try {
    const { nationalId, specialties, location, serviceRange, experience, bio, price } = req.body;
    const userId = req.user.id;
    
    const user = await ProviderUser.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // تحديث البيانات
    if (nationalId) user.nationalId = nationalId;
    if (specialties) user.specialties = specialties;
    if (location) {
      user.location = {
        lat: location.lat,
        lng: location.lng,
        address: location.address
      };
    }
    if (serviceRange) user.serviceRange = serviceRange;
    if (experience) user.experience = experience;
    if (bio) user.bio = bio;
    if (price) user.price = price;
    
    // معالجة الصور (لو موجودة)
    const files = req.files;
    if (files) {
      if (files.idCardFront) user.idCardFront = files.idCardFront[0].path; // مؤقت، استخدم Cloudinary لاحقاً
      if (files.idCardBack) user.idCardBack = files.idCardBack[0].path;
      if (files.selfie) user.selfie = files.selfie[0].path;
    }
    
    user.isProfileComplete = true;
    user.isApproved = false; // انتظار موافقة الإدارة
    await user.save();
    
    res.json({
      message: 'Profile completed successfully. Waiting for admin approval.',
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        isApproved: user.isApproved,
        isProfileComplete: user.isProfileComplete
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ========== 4. جلب الملف الشخصي ==========
exports.getProfile = async (req, res) => {
  try {
    const user = await ProviderUser.findById(req.user.id);
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ========== 5. تحديث حالة التوفر ==========
exports.updateAvailability = async (req, res) => {
  try {
    const { isOnline } = req.body;
    const user = await ProviderUser.findById(req.user.id);
    
    user.isOnline = isOnline;
    user.lastSeen = new Date();
    await user.save();
    
    res.json({ message: `You are now ${isOnline ? 'online' : 'offline'}`, isOnline: user.isOnline });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};