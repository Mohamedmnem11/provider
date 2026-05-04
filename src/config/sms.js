const sendOTP = async (phone, code) => {
  console.log(`📱 [SMS SIMULATION] To ${phone}: Your verification code is ${code}`);
  // TODO: استبدل بخدمة حقيقية مثل Twilio أو MoceanAPI
  return true;
};

module.exports = sendOTP;