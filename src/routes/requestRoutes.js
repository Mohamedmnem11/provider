const express = require('express');
const { 
  getMyRequests, getRequestById, updateRequestStatus, 
  acceptRequest, rejectRequest, updateAvailability 
} = require('../controllers/requestController');
const { authMiddleware, requireProfileComplete } = require('../middleware/auth');
const router = express.Router();

router.use(authMiddleware);
router.use(requireProfileComplete);

router.get('/', getMyRequests);
router.get('/:id', getRequestById);
router.patch('/:id/status', updateRequestStatus);
router.post('/:id/accept', acceptRequest);
router.post('/:id/reject', rejectRequest);
router.patch('/availability', updateAvailability);

module.exports = router;