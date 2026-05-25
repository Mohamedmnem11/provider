const { getDistance } = require('./distance');

function calculatePriceForTowing(distanceKm) {
  // مثال: 50 ج.م + 5 ج.م لكل كيلومتر
  const base = 50;
  const perKm = 5;
  return Math.round(base + distanceKm * perKm);
}

function calculateEstimatedArrival(distanceKm, speedKmPerHour = 30) {
  const hours = distanceKm / speedKmPerHour;
  return Math.ceil(hours * 60); // دقائق
}

module.exports = { calculatePriceForTowing, calculateEstimatedArrival, getDistance };