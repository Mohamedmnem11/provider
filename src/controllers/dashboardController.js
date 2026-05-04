// في src/controllers/dashboardController.js (جديد)
exports.getDashboard = async (req, res) => {
  try {
    const providerId = req.user.id;
    
    // الطلبات الواردة
    const pendingRequests = await ProviderRequest.find({ 
      providerId, 
      status: 'pending' 
    });
    
    // الطلبات النشطة (قيد التنفيذ)
    const activeRequests = await ProviderRequest.find({ 
      providerId, 
      status: { $in: ['accepted', 'on_the_way', 'in_progress'] }
    });
    
    // الطلبات المكتملة
    const completedRequests = await ProviderRequest.find({ 
      providerId, 
      status: 'completed' 
    });
    
    // حساب الإيرادات
    const totalEarnings = completedRequests.reduce((sum, r) => sum + (r.price || 0), 0);
    
    // التقييمات
    const reviews = await ProviderRequest.find({ 
      providerId, 
      customerRating: { $exists: true }
    }).sort({ createdAt: -1 }).limit(10);
    
    res.json({
      stats: {
        pending: pendingRequests.length,
        active: activeRequests.length,
        completed: completedRequests.length,
        totalEarnings,
        rating: req.user.rating,
        totalRatings: req.user.totalRatings
      },
      recentRequests: [...pendingRequests, ...activeRequests].slice(0, 10),
      recentReviews: reviews
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};