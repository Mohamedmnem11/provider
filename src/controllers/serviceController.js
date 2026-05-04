const ProviderService = require('../models/ProviderService');

// إضافة خدمة جديدة
exports.createService = async (req, res) => {
  try {
    const { name, description, price, category, estimatedTime } = req.body;
    const service = new ProviderService({
      providerId: req.user.id,
      name,
      description,
      price,
      category,
      estimatedTime: estimatedTime || 30
    });
    await service.save();
    res.status(201).json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// جلب جميع خدمات مقدم الخدمة الحالي
exports.getMyServices = async (req, res) => {
  try {
    const services = await ProviderService.find({ providerId: req.user.id });
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// تحديث خدمة
exports.updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await ProviderService.findOne({ _id: id, providerId: req.user.id });
    if (!service) return res.status(404).json({ message: 'Service not found' });
    
    const { name, description, price, category, estimatedTime, isActive } = req.body;
    if (name) service.name = name;
    if (description) service.description = description;
    if (price) service.price = price;
    if (category) service.category = category;
    if (estimatedTime) service.estimatedTime = estimatedTime;
    if (isActive !== undefined) service.isActive = isActive;
    
    await service.save();
    res.json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// حذف خدمة (تعطيلها)
exports.deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await ProviderService.findOneAndDelete({ _id: id, providerId: req.user.id });
    if (!service) return res.status(404).json({ message: 'Service not found' });
    res.json({ message: 'Service deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};