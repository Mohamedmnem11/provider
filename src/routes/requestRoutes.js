const express = require('express');
const { 
  getMyRequests, getRequestById, updateRequestStatus, 
  acceptRequest, rejectRequest, updateAvailability 
} = require('../controllers/requestController');
const { authMiddleware, requireSubscription } = require('../middleware/auth');

const router = express.Router();

// مصادقة مقدم الخدمة (بدون إلزامية إكمال الملف الشخصي)
router.use(authMiddleware);
// اختياري: تفعيل اشتراط الاشتراك النشط
// router.use(requireSubscription);

router.get('/', getMyRequests);
router.get('/:id', getRequestById);
router.patch('/:id/status', updateRequestStatus);
router.post('/:id/accept', acceptRequest);
router.post('/:id/reject', rejectRequest);
router.patch('/availability', updateAvailability);

module.exports = router;