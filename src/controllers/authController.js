const ProviderUser = require('../models/ProviderUser');
const ProviderOTP = require('../models/ProviderOTP');
const generateOTP = require('../utils/generateOTP');
const sendOTP = require('../config/sms');
const jwt = require('jsonwebtoken');

// ========== 1. إرسال OTP ==========
exports.sendOTP = async (req, res) => {
  try {
    const { phone } = req.body;
    
    if (!phone || !/^01[0-9]{9}$/.test(phone)) {
      return res.status(400).json({ message: 'Valid Egyptian phone number is required (01xxxxxxxxx)' });
    }
    
    const code = generateOTP();
    await ProviderOTP.deleteMany({ phone });
    await ProviderOTP.create({ phone, code });
    await sendOTP(phone, code);
    
    console.log(`📱 OTP sent to ${phone}: ${code}`);
    
    res.json({ message: 'Verification code sent successfully', phone });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// ========== 2. التحقق من OTP ==========
exports.verifyOTP = async (req, res) => {
  try {
    const { phone, code } = req.body;
    
    const otpRecord = await ProviderOTP.findOne({ phone, code });
    if (!otpRecord || otpRecord.expiresAt < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }
    
    let user = await ProviderUser.findOne({ phone });
    let isNewUser = false;
    
    if (!user) {
      // إنشاء مستخدم بدون اسم (سيتم إضافة الاسم في completeProfile)
      user = new ProviderUser({ phone, name: '' });
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
        isProfileComplete: user.isProfileComplete || false,
        isApproved: user.isApproved || false,
        subscriptionStatus: user.subscriptionStatus
      },
      isNewUser
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// ========== 3. إكمال الملف الشخصي ==========
// exports.completeProfile = async (req, res) => {
//   try {
//     const { 
//       name,
//       specialties,
//       experience,
//       bio,
//       location,
//       serviceRange,
//       prices
//     } = req.body;
    
//     const userId = req.user.id;
    
//     const user = await ProviderUser.findById(userId);
//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }
    
//     // ========== 1. تحديث الاسم ==========
//     if (name && name.trim() !== '') {
//       user.name = name;
//     }
    
//     // ========== 2. تحديث التخصصات ==========
//     if (specialties) {
//       if (typeof specialties === 'string') {
//         if (specialties.includes(',')) {
//           user.specialties = specialties.split(',').map(s => s.trim());
//         } else {
//           user.specialties = [specialties];
//         }
//       } else if (Array.isArray(specialties)) {
//         user.specialties = specialties;
//       } else if (typeof specialties === 'object') {
//         user.specialties = specialties;
//       }
//     }
    
//     // ========== 3. تحديث الخبرة ==========
//     if (experience) {
//       user.experience = parseInt(experience);
//     }
    
//     // ========== 4. تحديث النبذة ==========
//     if (bio && bio.trim() !== '') {
//       user.bio = bio;
//     }
    
//     // ========== 5. تحديث الموقع ==========
//     if (location) {
//       user.location = {
//         lat: parseFloat(location.lat),
//         lng: parseFloat(location.lng),
//         address: location.address || ''
//       };
//     }
    
//     // ========== 6. تحديث نطاق الخدمة ==========
//     if (serviceRange) {
//       let range = parseInt(serviceRange);
//       if (range < 1) range = 1;
//       if (range > 50) range = 50;
//       user.serviceRange = range;
//     }
    
//     // ========== 7. تحديث الأسعار ==========
//     if (prices) {
//       if (prices.towing) user.towingPrice = parseFloat(prices.towing);
//       if (prices.mechanic) user.mechanicPrice = parseFloat(prices.mechanic);
//       if (prices.electrician) user.electricianPrice = parseFloat(prices.electrician);
//       if (prices.tire) user.tirePrice = parseFloat(prices.tire);
//       if (prices.workshop) user.workshopPrice = parseFloat(prices.workshop);
//       if (prices.battery) user.batteryPrice = parseFloat(prices.battery);
//       if (prices.fuel) user.fuelPrice = parseFloat(prices.fuel);
//     }
    
//     // ========== 8. رفع الصور ==========
//     const files = req.files;
//     if (files) {
//       if (files.idCardFront && files.idCardFront[0]) {
//         user.idCardFront = files.idCardFront[0].originalname;
//       }
//       if (files.idCardBack && files.idCardBack[0]) {
//         user.idCardBack = files.idCardBack[0].originalname;
//       }
//       if (files.selfie && files.selfie[0]) {
//         user.selfie = files.selfie[0].originalname;
//       }
//       if (files.towLicenseFront && files.towLicenseFront[0]) {
//         user.towLicenseFront = files.towLicenseFront[0].originalname;
//       }
//       if (files.towLicenseBack && files.towLicenseBack[0]) {
//         user.towLicenseBack = files.towLicenseBack[0].originalname;
//       }
//     }
    
//     user.isProfileComplete = true;
//     user.isApproved = false;
//     await user.save();
    
//     res.status(200).json({
//       message: 'Profile completed successfully. Waiting for admin approval.',
//       user: {
//         id: user._id,
//         name: user.name,
//         phone: user.phone,
//         specialties: user.specialties,
//         experience: user.experience,
//         bio: user.bio,
//         location: user.location,
//         serviceRange: user.serviceRange,
//         isApproved: user.isApproved,
//         isProfileComplete: user.isProfileComplete
//       }
//     });
    
//   } catch (error) {
//     console.error('❌ Error in completeProfile:', error);
//     res.status(500).json({ 
//       message: 'Error completing profile',
//       error: error.message 
//     });
//   }
// };




exports.completeProfile = async (req, res) => {
  try {
    let { 
      name,
      specialties,
      experience,
      bio,
      location,
      serviceRange,
      prices
    } = req.body;
    
    const userId = req.user.id;
    const user = await ProviderUser.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // ========== 1. تحديث الاسم ==========
    if (name && name.trim() !== '') {
      // إزالة علامات التنصيص الزائدة
      user.name = name.replace(/^"|"$/g, '').trim();
    }
    
    // ========== 2. تحديث التخصصات ==========
    if (specialties) {
      if (typeof specialties === 'string') {
        if (specialties.includes(',')) {
          user.specialties = specialties.split(',').map(s => s.trim());
        } else {
          user.specialties = [specialties];
        }
      } else if (Array.isArray(specialties)) {
        user.specialties = specialties;
      } else if (typeof specialties === 'object') {
        user.specialties = specialties;
      }
    }
    
    // ========== 3. تحديث الخبرة ==========
    if (experience) {
      user.experience = parseInt(experience);
    }
    
    // ========== 4. تحديث النبذة ==========
    if (bio && bio.trim() !== '') {
      user.bio = bio;
    }
    
    // ========== 5. تحديث الموقع ==========
    if (location) {
      let parsedLocation = location;
      if (typeof location === 'string') {
        try {
          parsedLocation = JSON.parse(location);
        } catch (error) {}
      }
      user.location = {
        lat: parseFloat(parsedLocation.lat) || 0,
        lng: parseFloat(parsedLocation.lng) || 0,
        address: parsedLocation.address || ''
      };
    }
    
    // ========== 6. تحديث نطاق الخدمة ==========
    if (serviceRange) {
      let range = parseInt(serviceRange);
      if (range < 1) range = 1;
      if (range > 50) range = 50;
      user.serviceRange = range;
    }
    
    // ========== 7. تحديث الأسعار ==========
    if (prices) {
      let parsedPrices = prices;
      if (typeof prices === 'string') {
        try {
          parsedPrices = JSON.parse(prices);
        } catch (error) {}
      }
      
      // ✅ استخدام towingPrice (موجود في Schema)
      if (parsedPrices.towing) {
        user.towingPrice = parseFloat(parsedPrices.towing);
      }
    }
    
    // ========== 8. رفع الصور ==========
    const files = req.files;
    if (files) {
      if (files.idCardFront && files.idCardFront[0]) {
        user.idCardFront = files.idCardFront[0].filename;
      }
      if (files.idCardBack && files.idCardBack[0]) {
        user.idCardBack = files.idCardBack[0].filename;
      }
      if (files.selfie && files.selfie[0]) {
        user.selfie = files.selfie[0].filename;
      }
      if (files.towLicenseFront && files.towLicenseFront[0]) {
        user.towLicenseFront = files.towLicenseFront[0].filename;
      }
      if (files.towLicenseBack && files.towLicenseBack[0]) {
        user.towLicenseBack = files.towLicenseBack[0].filename;
      }
    }
    
    user.isProfileComplete = true;
    user.isApproved = false;
    await user.save();
    
    // ✅ Response محسن
    res.status(200).json({
      message: 'Profile completed successfully. Waiting for admin approval.',
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        specialties: user.specialties,
        experience: user.experience,
        bio: user.bio,
        location: user.location,
        serviceRange: user.serviceRange,
        prices: {
          towing: user.towingPrice || 0
        },
        documents: {
          idCardFront: user.idCardFront,
          idCardBack: user.idCardBack,
          selfie: user.selfie,
          towLicenseFront: user.towLicenseFront,
          towLicenseBack: user.towLicenseBack
        },
        isApproved: user.isApproved,
        isProfileComplete: user.isProfileComplete,
        subscriptionStatus: user.subscriptionStatus
      }
    });
    
  } catch (error) {
    console.error('❌ Error in completeProfile:', error);
    res.status(500).json({ 
      message: 'Error completing profile',
      error: error.message 
    });
  }
};















// ========== 4. جلب الملف الشخصي ==========
exports.getProfile = async (req, res) => {
  try {
    const user = await ProviderUser.findById(req.user.id).select('-__v');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// ========== 5. تحديث الملف الشخصي ==========
exports.updateProfile = async (req, res) => {
  try {
    const { specialties, location, experience, bio, prices } = req.body;
    const user = await ProviderUser.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (specialties) user.specialties = specialties;
    if (location) user.location = location;
    if (experience) user.experience = experience;
    if (bio) user.bio = bio;
    
    if (prices) {
      if (prices.towing) user.towingPrice = prices.towing;
      if (prices.mechanic) user.mechanicPrice = prices.mechanic;
      if (prices.electrician) user.electricianPrice = prices.electrician;
      if (prices.tire) user.tirePrice = prices.tire;
      if (prices.workshop) user.workshopPrice = prices.workshop;
      if (prices.battery) user.batteryPrice = prices.battery;
      if (prices.fuel) user.fuelPrice = prices.fuel;
    }
    
    await user.save();
    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// ========== 6. تغيير حالة التوفر ==========
exports.updateAvailability = async (req, res) => {
  try {
    const { isOnline } = req.body;
    const user = await ProviderUser.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (isOnline && (user.subscriptionStatus !== 'active' || (user.subscriptionEndDate && user.subscriptionEndDate < new Date()))) {
      return res.status(403).json({ 
        message: 'Cannot go online. Subscription expired or not active.',
        subscriptionStatus: user.subscriptionStatus
      });
    }
    
    user.isOnline = isOnline;
    user.lastSeen = new Date();
    await user.save();
    
    res.json({ 
      message: `You are now ${isOnline ? 'online' : 'offline'}`, 
      isOnline: user.isOnline 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};