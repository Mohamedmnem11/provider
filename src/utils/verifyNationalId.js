function verifyNationalId(nationalId) {
  if (!/^\d{14}$/.test(nationalId)) {
    return { valid: false, error: 'الرقم القومي يجب أن يكون 14 رقمًا' };
  }

  const centuryCode = nationalId[0];
  const yearTwoDigits = nationalId.slice(1, 3);
  const month = nationalId.slice(3, 5);
  const day = nationalId.slice(5, 7);

  let fullYear;
  if (centuryCode === '2') fullYear = 1900 + parseInt(yearTwoDigits);
  else if (centuryCode === '3') fullYear = 2000 + parseInt(yearTwoDigits);
  else return { valid: false, error: 'رمز القرن غير صالح (يجب أن يكون 2 أو 3)' };

  const monthNum = parseInt(month);
  const dayNum = parseInt(day);
  if (monthNum < 1 || monthNum > 12) {
    return { valid: false, error: 'شهر الميلاد غير صالح (1-12)' };
  }
  
  const daysInMonth = new Date(fullYear, monthNum, 0).getDate();
  if (dayNum < 1 || dayNum > daysInMonth) {
    return { valid: false, error: 'يوم الميلاد غير صالح لهذا الشهر' };
  }

  const governorateCode = nationalId.slice(7, 9);
  const governorates = {
    '01': 'القاهرة', '02': 'الإسكندرية', '03': 'بورسعيد', '04': 'السويس',
    '11': 'دمياط', '12': 'الدقهلية', '13': 'الشرقية', '14': 'القليوبية',
    '15': 'كفر الشيخ', '16': 'الغربية', '17': 'المنوفية', '18': 'البحيرة',
    '19': 'الإسماعيلية', '21': 'الجيزة', '22': 'بني سويف', '23': 'الفيوم',
    '24': 'المنيا', '25': 'أسيوط', '26': 'سوهاج', '27': 'قنا',
    '28': 'أسوان', '29': 'الأقصر', '31': 'البحر الأحمر', '32': 'الوادي الجديد',
    '33': 'مطروح', '34': 'شمال سيناء', '35': 'جنوب سيناء'
  };

  return {
    valid: true,
    data: {
      birthDate: `${fullYear}-${month}-${day}`,
      century: centuryCode === '2' ? '1900s' : '2000s',
      governorate: governorates[governorateCode] || 'غير معروف',
      governorateCode,
      gender: parseInt(nationalId[12]) % 2 === 0 ? 'أنثى' : 'ذكر'
    }
  };
}

module.exports = verifyNationalId;