const ServiceRequest = require('../models/Request');
const ProviderUser = require('../models/ProviderUser');

// ========== جلب طلبات مقدم الخدمة (الواردة) ==========
exports.getMyRequests = async (req, res) => {
  try {
    const requests = await ServiceRequest.find({ assignedProviderId: req.user.id })
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ========== جلب تفاصيل طلب معين ==========
exports.getRequestById = async (req, res) => {
  try {
    const request = await ServiceRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.assignedProviderId?.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ========== قبول الطلب (خلال 15 ثانية) ==========
exports.acceptRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const providerId = req.user.id;

    const request = await ServiceRequest.findById(requestId);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.assignedProviderId?.toString() !== providerId) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request not pending' });
    }

    const now = new Date();
    const elapsed = (now - request.createdAt) / 1000;
    if (elapsed > 15) {
      request.status = 'timeout';
      request.timeoutAt = now;
      await request.save();
      return res.status(400).json({ message: 'Request timeout expired' });
    }

    request.status = 'accepted';
    request.acceptedAt = now;
    await request.save();

    res.json({ message: 'Request accepted', request });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ========== رفض الطلب مع سبب ==========
exports.rejectRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { cancelReason, customCancelReason } = req.body;
    const providerId = req.user.id;

    const request = await ServiceRequest.findById(requestId);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.assignedProviderId?.toString() !== providerId) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Cannot reject at this stage' });
    }

    const validReasons = [
      'accepted_by_mistake',
      'unsafe_location',
      'customer_not_responding',
      'distance_too_far',
      'vehicle_breakdown',
      'emergency_case',
      'other'
    ];
    if (!validReasons.includes(cancelReason)) {
      return res.status(400).json({ message: 'Invalid cancel reason' });
    }
    if (cancelReason === 'other' && !customCancelReason) {
      return res.status(400).json({ message: 'Custom reason required when other is selected' });
    }

    request.status = 'cancelled';
    request.cancelReason = cancelReason;
    request.customCancelReason = customCancelReason || '';
    await request.save();

    res.json({ message: 'Request rejected', request });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ========== تحديث حالة الطلب (accepted → on_the_way → in_progress → completed) ==========
exports.updateRequestStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body;
    const providerId = req.user.id;

    const request = await ServiceRequest.findById(requestId);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.assignedProviderId?.toString() !== providerId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const validTransitions = {
      accepted: ['on_the_way'],
      on_the_way: ['in_progress'],
      in_progress: ['completed'],
      completed: []
    };
    if (!validTransitions[request.status]?.includes(status)) {
      return res.status(400).json({ message: 'Invalid status transition' });
    }

    request.status = status;
    if (status === 'on_the_way') request.startedAt = new Date();
    if (status === 'completed') request.completedAt = new Date();
    await request.save();

    res.json({ message: `Status updated to ${status}`, request });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ========== تقييم العميل لمقدم الخدمة (يُستدعى من تطبيق العميل) ==========
exports.rateProvider = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { rating, review } = req.body;
    const customerId = req.user.id; // يجب أن يكون التوكن من العميل

    const request = await ServiceRequest.findById(requestId);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.customerId.toString() !== customerId) {
      return res.status(403).json({ message: 'Not your request' });
    }
    if (request.status !== 'completed') {
      return res.status(400).json({ message: 'Can only rate completed requests' });
    }
    if (request.customerRating) {
      return res.status(400).json({ message: 'Already rated' });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    request.customerRating = rating;
    request.customerReview = review || '';
    request.status = 'rated';
    request.ratedAt = new Date();
    await request.save();

    // تحديث متوسط تقييم مقدم الخدمة
    const provider = await ProviderUser.findById(request.assignedProviderId);
    const allRatings = await ServiceRequest.find({
      assignedProviderId: request.assignedProviderId,
      customerRating: { $exists: true, $ne: null }
    });
    const avg = allRatings.reduce((sum, r) => sum + r.customerRating, 0) / allRatings.length;
    provider.rating = Math.round(avg * 10) / 10;
    provider.totalRatings = allRatings.length;
    await provider.save();

    res.json({ message: 'Rating submitted', rating, providerRating: provider.rating });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ========== تحديث حالة التوفر (Online/Offline) ==========
exports.updateAvailability = async (req, res) => {
  try {
    const { isOnline } = req.body;
    const user = await ProviderUser.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (isOnline && (user.subscriptionStatus !== 'active' || 
        (user.subscriptionEndDate && user.subscriptionEndDate < new Date()))) {
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
    res.status(500).json({ message: error.message });
  }
};