## 📘 README.md – تطبيق مقدم الخدمة (Provider App)

> **ملخص ما تم إنجازه:** نظام كامل لإدارة مقدمي الخدمات (ميكانيكي، ونش، كهربائي، إطارات، ورشة، بطاريات، بنزين) مع تسجيل بالهاتف و OTP، اشتراكات، إدارة الخدمات، استقبال الطلبات مع مهلة 15 ثانية، حالات متعددة، أسباب إلغاء، وتقييمات.

---

## 🧰 التقنيات المستخدمة

| التقنية | الغرض |
|----------|--------|
| Node.js + Express | السيرفر الخلفي |
| MongoDB + Mongoose | قاعدة البيانات |
| JWT | المصادقة |
| Multer | رفع الصور (مؤقتاً) |
| Cloudinary (جاهز للتكامل) | تخزين الصور الحقيقي |
| OTP (محاكاة) | تجربة التحقق |

---

## 📁 هيكل المشروع

```
provider-backend/
├── .env
├── package.json
├── server.js
├── seed.js
├── src/
│   ├── config/
│   │   ├── database.js
│   │   ├── cloudinary.js
│   │   └── sms.js
│   ├── models/
│   │   ├── ProviderUser.js
│   │   ├── ProviderOTP.js
│   │   ├── ProviderService.js
│   │   └── Request.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── subscriptionController.js
│   │   ├── serviceController.js
│   │   └── requestController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── subscriptionRoutes.js
│   │   ├── serviceRoutes.js
│   │   └── requestRoutes.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── upload.js
│   └── utils/
│       ├── generateOTP.js
│       ├── distance.js
│       └── findNearestProviders.js
```

---

## 🗄️ نماذج قاعدة البيانات (Models) الرئيسية

### ProviderUser
| الحقل | النوع | ملاحظات |
|-------|-------|---------|
| name | String | اسم مقدم الخدمة |
| phone | String | فريد، إجباري |
| specialties | [String] | `mechanic`, `towing`, `electrician`, `tire`, `workshop`, `battery`, `fuel` |
| location {lat,lng,address} | Object | الموقع الجغرافي |
| serviceRange | Number | نطاق الخدمة بالكيلومترات (1-50) |
| towingPrice | Number | سعر الونش فقط |
| subscriptionStatus | String | `pending`, `active`, `expired`, `cancelled` |
| subscriptionEndDate | Date | تاريخ انتهاء الاشتراك |
| isApproved | Boolean | موافقة الإدارة |
| isOnline | Boolean | متاح حالياً للطلبات |
| rating | Number | متوسط التقييم |
| totalRatings | Number | عدد التقييمات |

### Request (الطلب الوارد)
| الحقل | النوع | ملاحظات |
|-------|-------|---------|
| customerName, customerPhone | String | بيانات العميل |
| startLocation {lat,lng,address} | Object | موقع بداية الخدمة (إجباري) |
| destination {lat,lng,address} | Object | اختياري |
| problemDescription | String | وصف المشكلة |
| estimatedDistance, estimatedArrivalTime | Number | تقديرات |
| estimatedPriceRange | String | للونش فقط |
| serviceType | String | نوع الخدمة |
| assignedProviderId | ObjectId | مقدم الخدمة المعين |
| status | String | `pending`, `accepted`, `on_the_way`, `in_progress`, `completed`, `cancelled`, `timeout`, `rated` |
| cancelReason, customCancelReason | String | أسباب الإلغاء |
| customerRating, customerReview | Number, String | التقييم بعد الإنجاز |

---

## 🔐 المصادقة (Authentication)

جميع الـ APIs (عدا تسجيل الدخول) تتطلب **Bearer Token** في الـ Header.

### 1. إرسال OTP

```http
POST /api/provider/auth/send-otp
Content-Type: application/json

{ "phone": "01010000001" }
```

### 2. التحقق من OTP وتسجيل الدخول

```http
POST /api/provider/auth/verify-otp
Content-Type: application/json

{ "phone": "01010000001", "code": "123456" }
```

> **الرد** يعيد `token` ويخبر إذا كان المستخدم جديداً (isNewUser) أم لا.

---

## 📋 جميع الـ Endpoints (المنجز)

### 🔹 الملف الشخصي والاشتراك

| الطريقة | المسار | الوصف | ملاحظات |
|---------|--------|-------|----------|
| `GET` | `/api/provider/auth/profile` | جلب الملف الشخصي | – |
| `PUT` | `/api/provider/auth/profile` | تحديث الملف الشخصي (جزئي) | – |
| `POST` | `/api/provider/auth/complete-profile` | إكمال الملف الشخصي (اسم، تخصصات، موقع، صور، أسعار للونش) | `multipart/form-data` |
| `PATCH` | `/api/provider/auth/availability` | تغيير الحالة (Online/Offline) | `{ "isOnline": true }` |
| `POST` | `/api/provider/subscription/activate` | تفعيل الاشتراك | `{ "plan": "premium", "durationDays": 30 }` |
| `GET` | `/api/provider/subscription/status` | حالة الاشتراك | – |
| `POST` | `/api/provider/subscription/renew` | تجديد الاشتراك | `{ "durationDays": 30 }` |

### 🔹 إدارة الخدمات (اختياري – يمكن إلغاؤه)

| الطريقة | المسار | الوصف |
|---------|--------|-------|
| `POST` | `/api/provider/services` | إضافة خدمة (اسم، سعر، فئة) |
| `GET` | `/api/provider/services` | جلب جميع خدمات مقدم الخدمة |
| `PUT` | `/api/provider/services/:id` | تحديث خدمة |
| `DELETE` | `/api/provider/services/:id` | حذف خدمة |

> **ملاحظة:** الأسعار الأساسية موجودة في نموذج `ProviderUser` (مثل `towingPrice`). هذا الـ API إضافي.

### 🔹 الطلبات الواردة

| الطريقة | المسار | الوصف | Body |
|---------|--------|-------|------|
| `GET` | `/api/provider/requests` | جلب جميع الطلبات المخصصة لمقدم الخدمة | – |
| `GET` | `/api/provider/requests/:id` | تفاصيل طلب معين | – |
| `POST` | `/api/provider/requests/:id/accept` | قبول الطلب (خلال 15 ثانية) | – |
| `POST` | `/api/provider/requests/:id/reject` | رفض الطلب مع سبب | `{ "cancelReason": "distance_too_far" }` أو `{ "cancelReason": "other", "customCancelReason": "..." }` |
| `PATCH` | `/api/provider/requests/:id/status` | تحديث الحالة (`accepted` → `on_the_way` → `in_progress` → `completed`) | `{ "status": "on_the_way" }` |

> **أسباب الإلغاء المقبولة:**  
> `accepted_by_mistake`, `unsafe_location`, `customer_not_responding`, `distance_too_far`, `vehicle_breakdown`, `emergency_case`, `other`.

---

## ⏱️ آلية الطلب والمهلة (Timeout)

- الطلب ينشأ بحالة `pending`.
- مقدم الخدمة لديه **15 ثانية** ليقوم بقبوله (عبر `accept`).
- إذا انقضت 15 ثانية دون قبول، تتحول الحالة تلقائياً إلى `timeout` (لا يمكن قبوله بعد ذلك).

---

## ⭐ التقييمات (Rating)

- بعد أن يصبح الطلب `completed`، يمكن للعميل (عبر Customer API) إرسال تقييم (1-5 نجوم + تعليق اختياري).
- يتم تحديث متوسط تقييم مقدم الخدمة (`rating`) وعدد التقييمات (`totalRatings`) في نموذج `ProviderUser`.

---

## 🚀 إعداد وتشغيل المشروع

1. **استنساخ المشروع**  
   `git clone <repo>`
2. **تثبيت الحزم**  
   `npm install`
3. **إعداد ملف `.env`** (مثال):
   ```env
   PORT=3002
   MONGO_URI=mongodb://localhost:27017/mech-rescue-provider
   JWT_SECRET=your_secret_key
   CLOUDINARY_CLOUD_NAME=...
   CLOUDINARY_API_KEY=...
   CLOUDINARY_API_SECRET=...
   ```
4. **تشغيل السيرفر**  
   `nodemon server`
5. **إضافة بيانات تجريبية (seed)**  
   `node seed.js`  
   سينشئ مقدم خدمة (`01010000001`) وثلاثة طلبات تجريبية.

---

## ✅ ما تم إنجازه بالكامل في هذا التطبيق

| الميزة | الحالة |
|--------|--------|
| تسجيل/دخول بـ OTP (محاكاة) | ✅ |
| إدارة الملف الشخصي (اسم، تخصصات، موقع، صور مؤقتة، أسعار للونش فقط) | ✅ |
| نظام الاشتراكات (تفعيل، تجديد، صلاحية) | ✅ |
| تغيير حالة التوفر (Online/Offline) | ✅ |
| استقبال الطلبات الواردة (مع بيانات العميل، الموقع، الوجهة، وصف المشكلة، تقديرات) | ✅ |
| قبول/رفض الطلبات مع أسباب الإلغاء | ✅ |
| مهلة 15 ثانية (timeout) | ✅ |
| تحديث حالة الطلب (accepted → on_the_way → in_progress → completed) | ✅ |
| التقييم (rating) والتحديث التلقائي لمتوسط التقييم | ✅ |
| قاعدة بيانات جاهزة (Models) | ✅ |
| إدارة خدمات إضافية (اختياري) | ✅ |

---

## ⚠️ ملاحظات – ما لم ينجز بعد

- **رفع الصور حقيقياً** إلى Cloudinary (يتم حالياً تخزين `originalname` فقط – سهل التكامل لاحقاً).
- **إرسال OTP حقيقي** عبر WhatsApp Cloud API أو Twilio (محاكاة `console.log` حالياً).
- **Admin Panel** لقبول مقدمي الخدمة (`isApproved`) ومراجعة المستندات.
- **واجهة المستخدم (UI)** لتطبيق مقدم الخدمة (React Native / Flutter).

---

## 📎 ملحق: مثال على طلب `complete-profile` (multipart/form-data)

```
POST /api/provider/auth/complete-profile
Authorization: Bearer <token>
Content-Type: multipart/form-data

name: محمد علي
specialties: ["towing","mechanic"]
experience: 10
bio: ونش إنقاذ وميكانيكي
location[lat]: 31.0450
location[lng]: 31.3850
location[address]: المنصورة، شارع الجيش
serviceRange: 25
prices[towing]: 350
idCardFront: (file)
idCardBack: (file)
selfie: (file)
towLicenseFront: (file)
towLicenseBack: (file)
```

