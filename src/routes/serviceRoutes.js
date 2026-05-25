const express = require('express');
const { createService, getMyServices, updateService, deleteService } = require('../controllers/serviceController');
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();

// كل هذه المسارات تحتاج مصادقة وملف شخصي مكتمل ومعتمد
router.use(authMiddleware);
// router.use(requireProfileComplete);

router.post('/', createService);
router.get('/', getMyServices);
router.put('/:id', updateService);
router.delete('/:id', deleteService);

module.exports = router;