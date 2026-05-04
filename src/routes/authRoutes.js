const express = require('express');
const {
  sendOTP,
  verifyOTP,
  completeProfile,
  getProfile,
  updateAvailability
} = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');
const upload = require('../middleware/upload');
const router = express.Router();

// Public routes
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);

// Protected routes
router.post('/complete-profile', authMiddleware, upload.fields([
  { name: 'idCardFront', maxCount: 1 },
  { name: 'idCardBack', maxCount: 1 },
  { name: 'selfie', maxCount: 1 }
]), completeProfile);
router.get('/profile', authMiddleware, getProfile);
router.patch('/availability', authMiddleware, updateAvailability);

module.exports = router;