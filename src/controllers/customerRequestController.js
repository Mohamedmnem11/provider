const ServiceRequest = require('../models/Request');
const ProviderUser = require('../models/ProviderUser');
const { getDistance, calculateEstimatedArrival, calculatePriceForTowing } = require('../utils/estimations');

// إنشاء طلب خدمة (يُستخدم من تطبيق العميل)
exports.createRequest = async (req, res) => {
  try {
    const {
      serviceType,
      startLocation,     // { lat, lng, address }
      destination,       // optional { lat, lng, address }
      problemDescription
    } = req.body;
    const customerId = req.user.id;
    const customerName = req.user.name;
    const customerPhone = req.user.phone;

    // التحقق من صحة البيانات
    if (!serviceType || !startLocation) {
      return res.status(400).json({ message: 'Service type and start location are required' });
    }

    // حساب المسافة التقديرية بين البداية والوجهة (إذا وُجدت)
    let estimatedDistance = 0;
    if (destination && destination.lat && destination.lng) {
      estimatedDistance = getDistance(startLocation.lat, startLocation.lng, destination.lat, destination.lng);
    }

    // الوقت التقديري للوصول (دقائق) – يمكن حسابه بناءً على المسافة وسرعة افتراضية
    const estimatedArrivalTime = Math.ceil(estimatedDistance / 30 * 60); // 30 km/h تقريباً

    // السعر التقديري (للونش فقط)
    let estimatedPriceRange = '';
    if (serviceType === 'towing') {
      const price = calculatePriceForTowing(estimatedDistance);
      estimatedPriceRange = `${price} - ${price + 50} ج.م`;
    }

    const request = new ServiceRequest({
      customerId,
      customerName,
      customerPhone,
      startLocation,
      destination: destination || null,
      problemDescription: problemDescription || '',
      estimatedDistance,
      estimatedArrivalTime,
      estimatedPriceRange,
      serviceType,
      status: 'pending'
    });

    // البحث عن مقدم خدمة مناسب (الأقرب والمتاح)
    const providers = await ProviderUser.find({
      isApproved: true,
      isOnline: true,
      specialties: serviceType,
      subscriptionStatus: 'active',
      subscriptionEndDate: { $gt: new Date() }
    });
    if (providers.length === 0) {
      return res.status(404).json({ message: 'No providers available' });
    }

    let nearest = null;
    let minDist = Infinity;
    for (const p of providers) {
      if (p.location && p.location.lat) {
        const dist = getDistance(startLocation.lat, startLocation.lng, p.location.lat, p.location.lng);
        if (dist < minDist) {
          minDist = dist;
          nearest = p;
        }
      }
    }
    if (!nearest) {
      return res.status(404).json({ message: 'No provider in range' });
    }

    request.assignedProviderId = nearest._id;
    request.assignedProviderName = nearest.name;
    request.assignedProviderPhone = nearest.phone;
    await request.save();

    // بعد 15 ثانية، إذا لم يتم قبول الطلب، يتغير إلى timeout
    setTimeout(async () => {
      const stillPending = await ServiceRequest.findById(request._id);
      if (stillPending && stillPending.status === 'pending') {
        stillPending.status = 'timeout';
        stillPending.timeoutAt = new Date();
        await stillPending.save();
      }
    }, 15000);

    res.status(201).json({
      message: 'Request created, waiting for provider acceptance',
      requestId: request._id,
      assignedProvider: {
        id: nearest._id,
        name: nearest.name,
        phone: nearest.phone
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};