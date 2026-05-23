const ProviderUser = require('../models/ProviderUser');

// تفعيل اشتراك مقدم الخدمة
exports.activateSubscription = async (req, res) => {
  try {
    const { plan, durationDays } = req.body;
    const providerId = req.user.id;
    
    const validPlans = ['basic', 'premium', 'professional'];
    if (!validPlans.includes(plan)) {
      return res.status(400).json({ message: 'Invalid subscription plan. Available: basic, premium, professional' });
    }
    
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + durationDays);
    
    const provider = await ProviderUser.findById(providerId);
    provider.subscriptionStatus = 'active';
    provider.subscriptionPlan = plan;
    provider.subscriptionStartDate = new Date();
    provider.subscriptionEndDate = endDate;
    await provider.save();
    
    res.json({
      message: 'Subscription activated successfully',
      subscriptionStatus: provider.subscriptionStatus,
      subscriptionPlan: provider.subscriptionPlan,
      subscriptionEndDate: provider.subscriptionEndDate
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// جلب حالة الاشتراك
exports.getSubscriptionStatus = async (req, res) => {
  try {
    const provider = await ProviderUser.findById(req.user.id)
      .select('subscriptionStatus subscriptionPlan subscriptionEndDate subscriptionStartDate');
    res.json(provider);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// تجديد الاشتراك
exports.renewSubscription = async (req, res) => {
  try {
    const { durationDays } = req.body;
    const provider = await ProviderUser.findById(req.user.id);
    
    if (provider.subscriptionStatus !== 'active' && provider.subscriptionStatus !== 'expired') {
      return res.status(400).json({ message: 'Cannot renew subscription' });
    }
    
    let newEndDate = new Date();
    if (provider.subscriptionEndDate && provider.subscriptionEndDate > new Date()) {
      newEndDate = provider.subscriptionEndDate;
    }
    newEndDate.setDate(newEndDate.getDate() + durationDays);
    
    provider.subscriptionEndDate = newEndDate;
    provider.subscriptionStatus = 'active';
    await provider.save();
    
    res.json({
      message: 'Subscription renewed successfully',
      subscriptionEndDate: provider.subscriptionEndDate
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// فحص الاشتراكات منتهية الصلاحية (Cron Job)
exports.checkExpiredSubscriptions = async () => {
  try {
    const expiredProviders = await ProviderUser.updateMany(
      {
        subscriptionStatus: 'active',
        subscriptionEndDate: { $lt: new Date() }
      },
      {
        subscriptionStatus: 'expired',
        isOnline: false
      }
    );
    console.log(`✅ Updated ${expiredProviders.modifiedCount} expired subscriptions`);
  } catch (error) {
    console.error('Error checking expired subscriptions:', error);
  }
};