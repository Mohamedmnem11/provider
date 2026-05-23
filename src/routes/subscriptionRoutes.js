const express = require('express');
const { 
  activateSubscription, 
  getSubscriptionStatus, 
  renewSubscription 
} = require('../controllers/subscriptionController');
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();

router.post('/activate', authMiddleware, activateSubscription);
router.get('/status', authMiddleware, getSubscriptionStatus);
router.post('/renew', authMiddleware, renewSubscription);

module.exports = router;