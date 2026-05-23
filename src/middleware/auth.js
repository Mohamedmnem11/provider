const jwt = require('jsonwebtoken');
const ProviderUser = require('../models/ProviderUser');

const authMiddleware = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await ProviderUser.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    req.user = {
      id: user._id,
      name: user.name,
      phone: user.phone,
      role: 'provider'
    };
    
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token is not valid' });
  }
};

const requireSubscription = async (req, res, next) => {
  try {
    const provider = await ProviderUser.findById(req.user.id);
    if (!provider) {
      return res.status(404).json({ message: 'Provider not found' });
    }
    
    if (provider.subscriptionStatus !== 'active' || 
        (provider.subscriptionEndDate && provider.subscriptionEndDate < new Date())) {
      return res.status(403).json({ 
        message: 'Subscription expired. Please renew to continue receiving requests.',
        subscriptionStatus: provider.subscriptionStatus
      });
    }
    
    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { authMiddleware, requireSubscription };