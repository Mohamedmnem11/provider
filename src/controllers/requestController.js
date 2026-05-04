const ProviderRequest = require('../models/Request');
const ProviderService = require('../models/ProviderService');
const ProviderUser = require('../models/ProviderUser');

// جلب الطلبات الواردة لمقدم الخدمة
exports.getMyRequests = async (req, res) => {
  try {
    const requests = await ProviderRequest.find({ providerId: req.user.id })
      .populate('serviceId', 'name price')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// جلب تفاصيل طلب معين
exports.getRequestById = async (req, res) => {
  try {
    const request = await ProviderRequest.findOne({ 
      _id: req.params.id, 
      providerId: req.user.id 
    }).populate('serviceId', 'name price estimatedTime');
    
    if (!request) return res.status(404).json({ message: 'Request not found' });
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// تحديث حالة الطلب
exports.updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const request = await ProviderRequest.findOne({ _id: id, providerId: req.user.id });
    if (!request) return res.status(404).json({ message: 'Request not found' });
    
    const validTransitions = {
      pending: ['accepted', 'rejected'],
      accepted: ['on_the_way', 'cancelled'],
      on_the_way: ['in_progress', 'cancelled'],
      in_progress: ['completed', 'cancelled'],
      completed: [],
      rejected: [],
      cancelled: []
    };
    
    if (!validTransitions[request.status]?.includes(status)) {
      return res.status(400).json({ message: 'Invalid status transition' });
    }
    
    request.status = status;
    if (status === 'on_the_way') request.startedAt = new Date();
    if (status === 'completed') request.completedAt = new Date();
    
    await request.save();
    res.json({ message: 'Status updated', request });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// قبول طلب
exports.acceptRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await ProviderRequest.findOne({ _id: id, providerId: req.user.id });
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request already processed' });
    }
    
    request.status = 'accepted';
    await request.save();
    
    // TODO: إرسال إشعار للعميل
    res.json({ message: 'Request accepted', request });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// رفض طلب
exports.rejectRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const request = await ProviderRequest.findOne({ _id: id, providerId: req.user.id });
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request already processed' });
    }
    
    request.status = 'rejected';
    request.notes = reason || 'Rejected by provider';
    await request.save();
    
    res.json({ message: 'Request rejected', request });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// تحديث حالة التوفر (online/offline)
exports.updateAvailability = async (req, res) => {
  try {
    const { isAvailable } = req.body;
    const user = await ProviderUser.findById(req.user.id);
    user.isAvailable = isAvailable;
    await user.save();
    res.json({ message: `You are now ${isAvailable ? 'available' : 'unavailable'}`, isAvailable });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};