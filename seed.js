require('dotenv').config();
const mongoose = require('mongoose');
const ProviderUser = require('./src/models/ProviderUser');
const ServiceRequest = require('./src/models/Request');
const ProviderOTP = require('./src/models/ProviderOTP');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mech-rescue-provider';

const seedProvider = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // حذف البيانات القديمة (اختياري)
    await ProviderUser.deleteMany({});
    await ServiceRequest.deleteMany({});
    await ProviderOTP.deleteMany({});
    console.log('🗑️ Old data cleared');

    // إنشاء مقدم خدمة جديد (سيتم تفعيله مباشرة)
    const provider = new ProviderUser({
      name: 'محمد علي',
      phone: '01010007689',
      specialties: ['towing', 'mechanic'],
      location: {
        lat: 31.045,
        lng: 31.385,
        address: 'المنصورة، شارع الجيش'
      },
      serviceRange: 25,
      towingPrice: 350,
      isPhoneVerified: true,
      isProfileComplete: true,
      isApproved: true,          // موافق عليه
      isOnline: true,
      subscriptionStatus: 'active',
      subscriptionPlan: 'premium',
      subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      experience: 10,
      bio: 'ونش إنقاذ وميكانيكي محترف'
    });
    await provider.save();
    console.log(`✅ Provider created: ${provider.name} (${provider.phone})`);

    // إنشاء طلبات تجريبية (معلقة، مقبولة، مكتملة) مرتبطة بنفس مقدم الخدمة
    const customerIdBase = new mongoose.Types.ObjectId();

    const requests = [
      {
        customerId: new mongoose.Types.ObjectId(),
        customerName: 'أحمد محمد',
        customerPhone: '01012345678',
        startLocation: { lat: 31.04, lng: 31.38, address: 'المنصورة، تقاطع الجيش' },
        destination: { lat: 31.065, lng: 31.40, address: 'الورشة، شارع النيل' },
        problemDescription: 'العربية واقفة ومش بتدور',
        estimatedDistance: 5.2,
        estimatedArrivalTime: 12,
        estimatedPriceRange: '350 - 400 ج.م',
        serviceType: 'towing',
        assignedProviderId: provider._id,
        assignedProviderName: provider.name,
        assignedProviderPhone: provider.phone,
        status: 'pending',
        createdAt: new Date()
      },
      {
        customerId: new mongoose.Types.ObjectId(),
        customerName: 'سامي إبراهيم',
        customerPhone: '01098765432',
        startLocation: { lat: 31.05, lng: 31.39, address: 'المنصورة، شارع المدارس' },
        destination: null,
        problemDescription: 'بطارية فارغة',
        estimatedDistance: 0,
        estimatedArrivalTime: 5,
        estimatedPriceRange: '',
        serviceType: 'battery',
        assignedProviderId: provider._id,
        assignedProviderName: provider.name,
        assignedProviderPhone: provider.phone,
        status: 'accepted',
        acceptedAt: new Date(),
        createdAt: new Date(Date.now() - 10 * 60000)
      },
      {
        customerId: new mongoose.Types.ObjectId(),
        customerName: 'خالد سعيد',
        customerPhone: '01011223344',
        startLocation: { lat: 31.03, lng: 31.37, address: 'المنصورة، شارع البحر' },
        destination: null,
        problemDescription: 'تغيير إطار',
        estimatedDistance: 0,
        estimatedArrivalTime: 8,
        estimatedPriceRange: '',
        serviceType: 'tire',
        assignedProviderId: provider._id,
        assignedProviderName: provider.name,
        assignedProviderPhone: provider.phone,
        status: 'completed',
        completedAt: new Date(),
        createdAt: new Date(Date.now() - 2 * 60 * 60000)
      }
    ];

    await ServiceRequest.insertMany(requests);
    console.log(`✅ ${requests.length} sample requests created`);

    console.log('\n📱 الآن يمكنك اختبار APIs باستخدام هذا الرقم:');
    console.log(`   Phone: ${provider.phone}`);
    console.log('\n❗ أولاً: استخدم send-otp ثم verify-otp للحصول على token');
    console.log('   (الـ OTP سيظهر في التيرمنال لأنه محاكاة)');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedProvider();