# 🔧 Mech Rescue - Provider API

تطبيق مقدم الخدمة لإدارة طلبات تصليح السيارات

## 🚀 التشغيل

```bash
npm install
npm run dev
```
السيرفر: `http://localhost:3002`

## 📦 ملف `.env`

```env
PORT=3002
MONGO_URI=mongodb://localhost:27017/mech-rescue-provider
JWT_SECRET=provider_jwt_secret_key

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## 🔐 المصادقة

### `POST /api/provider/auth/send-otp`
إرسال رمز التحقق
```json
{ "phone": "01010000001" }
```

### `POST /api/provider/auth/verify-otp`
التحقق من الرمز (تسجيل/دخول)
```json
{ "phone": "01010000001", "code": "123456", "name": "Mohamed" }
```

### `POST /api/provider/auth/login`
تسجيل الدخول (للمستخدمين الموجودين)
```json
{ "email": "mohamed@example.com", "password": "123456" }
```

### `GET /api/provider/auth/profile`
جلب الملف الشخصي (يتطلب Token)

### `PUT /api/provider/auth/profile`
تحديث الملف الشخصي
```json
{ "specialties": ["mechanic"], "price": 150, "experience": 10 }
```

### `PATCH /api/provider/auth/availability`
تغيير حالة التوفر
```json
{ "isOnline": true }
```

---

## 📄 إكمال الملف الشخصي

### `POST /api/provider/auth/complete-profile`
رفع المستندات والموقع (multipart/form-data)

| الحقل | النوع | الوصف |
|-------|------|-------|
| `nationalId` | text | الرقم القومي 14 رقم |
| `specialties` | text | `["mechanic"]` |
| `location[lat]` | text | خط العرض |
| `location[lng]` | text | خط الطول |
| `location[address]` | text | العنوان |
| `serviceRange` | text | نطاق الخدمة (كم) |
| `experience` | text | سنوات الخبرة |
| `bio` | text | نبذة تعريفية |
| `price` | text | سعر الخدمة |
| `idCardFront` | file | صورة وجه البطاقة |
| `idCardBack` | file | صورة ظهر البطاقة |
| `selfie` | file | صورة شخصية |

---

## 🔧 الخدمات

### `POST /api/provider/services`
إضافة خدمة (يتطلب Token)
```json
{ "name": "ونش إنقاذ", "price": 350, "category": "towing", "estimatedTime": 20 }
```

### `GET /api/provider/services`
جلب جميع خدماتي

### `PUT /api/provider/services/:id`
تحديث خدمة

### `DELETE /api/provider/services/:id`
حذف خدمة

**فئات الخدمات:** `mechanic` | `electrician` | `tire` | `workshop` | `battery` | `fuel` | `towing`

---

## 📋 الطلبات

### `GET /api/provider/requests`
جلب الطلبات المخصصة لي

### `POST /api/provider/requests/:id/accept`
قبول طلب

### `POST /api/provider/requests/:id/reject`
رفض طلب
```json
{ "reason": "خارج نطاق الخدمة" }
```

### `PATCH /api/provider/requests/:id/status`
تحديث حالة الطلب
```json
{ "status": "on_the_way" }
```

**حالات الطلب المسموحة:** `accepted` → `on_the_way` → `in_progress` → `completed`

---

## 🏷️ التخصصات

| القيمة | المعنى |
|--------|--------|
| `mechanic` | ميكانيكي |
| `electrician` | كهربائي |
| `tire` | إطارات |
| `workshop` | ورشة |
| `battery` | بطاريات |
| `fuel` | بنزين |

---

## 🧪 إضافة بيانات تجريبية

```bash
node seed.js
```

---

## ⚠️ ملاحظات

- الـ OTP حالياً **محاكاة** (يظهر في التيرمنال)
- الصور تُرفع إلى **Cloudinary** (مجاني)
- `isApproved` يحتاج موافقة إدارة

---

## 🔗 الروابط

- **Customer API**: `http://localhost:3000`
- **Provider API**: `http://localhost:3002`
