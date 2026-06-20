```markdown
# 📘 README.md – تطبيق مقدم الخدمة (Provider App)

> **ملخص ما تم إنجازه:** نظام كامل لإدارة مقدمي الخدمات (ميكانيكي، ونش، كهربائي، إطارات، ورشة، بطاريات، بنزين) مع تسجيل بالهاتف و OTP، اشتراكات، إدارة الخدمات، استقبال الطلبات مع مهلة 15 ثانية، حالات متعددة، أسباب إلغاء، وتقييمات.

---

## 📋 جدول المحتويات

- [التقنيات المستخدمة](#-التقنيات-المستخدمة)
- [هيكل المشروع](#-هيكل-المشروع)
- [نماذج قاعدة البيانات](#-نماذج-قاعدة-البيانات-models-الرئيسية)
- [المصادقة](#-المصادقة-authentication)
- [جميع الـ Endpoints](#-جميع-الـ-endpoints-المنجز)
- [ملاحظة مهمة عن Form-Data](#-ملاحظة-مهمة-عن-form-data-في-complete-profile)
- [أمثلة على الـ Requests](#-أمثلة-على-الـ-requests)
- [آلية الطلب والمهلة](#-آلية-الطلب-والمهلة-timeout)
- [التقييمات](#-التقييمات-rating)
- [إعداد وتشغيل المشروع](#-إعداد-وتشغيل-المشروع)
- [ما تم إنجازه](#-ما-تم-إنجازه-بالكامل-في-هذا-التطبيق)
- [ما لم ينجز بعد](#-ملاحظات--ما-لم-ينجز-بعد)
- [الدعم والتواصل](#-الدعم-والتواصل)
- [الترخيص](#-الترخيص)

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
| idCardFront | String | صورة البطاقة الأمامية |
| idCardBack | String | صورة البطاقة الخلفية |
| selfie | String | صورة شخصية |
| towLicenseFront | String | صورة رخصة الونش الأمامية |
| towLicenseBack | String | صورة رخصة الونش الخلفية |
| specialties | [String] | `mechanic`, `towing`, `electrician`, `tire`, `workshop`, `battery`, `fuel` |
| location {lat,lng,address} | Object | الموقع الجغرافي |
| serviceRange | Number | نطاق الخدمة بالكيلومترات (1-50) |
| towingPrice | Number | سعر الونش فقط |
| subscriptionStatus | String | `pending`, `active`, `expired`, `cancelled` |
| subscriptionPlan | String | `basic`, `premium`, `professional` |
| subscriptionEndDate | Date | تاريخ انتهاء الاشتراك |
| subscriptionStartDate | Date | تاريخ بداية الاشتراك |
| isPhoneVerified | Boolean | التحقق من رقم الهاتف |
| isProfileComplete | Boolean | اكتمال الملف الشخصي |
| isApproved | Boolean | موافقة الإدارة |
| rejectionReason | String | سبب الرفض (إن وجد) |
| isOnline | Boolean | متاح حالياً للطلبات |
| lastSeen | Date | آخر ظهور |
| experience | Number | سنوات الخبرة |
| bio | String | نبذة تعريفية |
| rating | Number | متوسط التقييم |
| totalRatings | Number | عدد التقييمات |
| createdAt | Date | تاريخ الإنشاء |

### Request (الطلب الوارد)

| الحقل | النوع | ملاحظات |
|-------|-------|---------|
| customerName | String | اسم العميل |
| customerPhone | String | رقم هاتف العميل |
| startLocation {lat,lng,address} | Object | موقع بداية الخدمة (إجباري) |
| destination {lat,lng,address} | Object | اختياري |
| problemDescription | String | وصف المشكلة |
| estimatedDistance | Number | المسافة المقدرة |
| estimatedArrivalTime | Number | وقت الوصول المقدر |
| estimatedPriceRange | String | نطاق السعر المقدر (للونش فقط) |
| serviceType | String | نوع الخدمة |
| assignedProviderId | ObjectId | مقدم الخدمة المعين |
| status | String | `pending`, `accepted`, `on_the_way`, `in_progress`, `completed`, `cancelled`, `timeout`, `rated` |
| cancelReason | String | سبب الإلغاء من القائمة المحددة |
| customCancelReason | String | سبب إلغاء مخصص (حالة "other") |
| customerRating | Number | تقييم العميل (1-5) |
| customerReview | String | تعليق العميل |
| acceptedAt | Date | وقت قبول الطلب |
| completedAt | Date | وقت إكمال الطلب |
| timeoutAt | Date | وقت انتهاء المهلة |
| createdAt | Date | تاريخ الإنشاء |

---

## 🔐 المصادقة (Authentication)

جميع الـ APIs (عدا تسجيل الدخول) تتطلب **Bearer Token** في الـ Header.

### 1. إرسال OTP

```http
POST /api/provider/auth/send-otp
Content-Type: application/json

{
  "phone": "01010000001"
}
```

**الرد:**
```json
{
  "message": "Verification code sent successfully",
  "phone": "01010000001"
}
```

### 2. التحقق من OTP وتسجيل الدخول

```http
POST /api/provider/auth/verify-otp
Content-Type: application/json

{
  "phone": "01010000001",
  "code": "123456"
}
```

**الرد:**
```json
{
  "message": "Account created successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "6a36f20c71fe17277354bbb5",
    "name": "",
    "phone": "01010000001",
    "isProfileComplete": false,
    "isApproved": false,
    "subscriptionStatus": "pending"
  },
  "isNewUser": true
}
```

---

## 📋 جميع الـ Endpoints (المنجز)

### 🔹 المصادقة والملف الشخصي

| الطريقة | المسار | الوصف | الملفات المرفوعة |
|---------|--------|-------|-------------------|
| `POST` | `/api/provider/auth/send-otp` | إرسال كود التحقق | – |
| `POST` | `/api/provider/auth/verify-otp` | التحقق من الكود وتسجيل الدخول | – |
| `GET` | `/api/provider/auth/profile` | جلب الملف الشخصي | – |
| `PUT` | `/api/provider/auth/profile` | تحديث الملف الشخصي (جزئي) | – |
| `POST` | `/api/provider/auth/complete-profile` | إكمال الملف الشخصي (اسم، تخصصات، موقع، صور، أسعار للونش) | `idCardFront`, `idCardBack`, `selfie`, `towLicenseFront`, `towLicenseBack` |
| `PATCH` | `/api/provider/auth/availability` | تغيير الحالة (Online/Offline) | – |

### 🔹 الاشتراكات

| الطريقة | المسار | الوصف | Body |
|---------|--------|-------|------|
| `POST` | `/api/provider/subscription/activate` | تفعيل الاشتراك | `{ "plan": "premium", "durationDays": 30 }` |
| `GET` | `/api/provider/subscription/status` | حالة الاشتراك | – |
| `POST` | `/api/provider/subscription/renew` | تجديد الاشتراك | `{ "durationDays": 30 }` |

### 🔹 إدارة الخدمات (اختياري)

| الطريقة | المسار | الوصف |
|---------|--------|-------|
| `POST` | `/api/provider/services` | إضافة خدمة (اسم، سعر، فئة) |
| `GET` | `/api/provider/services` | جلب جميع خدمات مقدم الخدمة |
| `PUT` | `/api/provider/services/:id` | تحديث خدمة |
| `DELETE` | `/api/provider/services/:id` | حذف خدمة |

> **ملاحظة:** الأسعار الأساسية موجودة في نموذج `ProviderUser` (مثل `towingPrice`). هذا الـ API إضافي للخدمات المتعددة.

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

## ⚠️ ملاحظة مهمة عن Form-Data في complete-profile

عند استخدام `multipart/form-data` في `complete-profile`:

- **specialties**: ترسل كـ String مفصول بفواصل (`towing,mechanic`) أو واحدة (`towing`)
- **prices**: ترسل كـ Object (`prices[towing]: 400`)
- **location**: ترسل كـ Object (`location[lat]: 31.045`)
- **experience, serviceRange**: ترسل كـ Numbers (`10`, `25`)

**جميع الحقول تصل كـ Strings ويتم Parsing تلقائياً في الـ Backend.**

---

## 📝 أمثلة على الـ Requests

### 1. إكمال الملف الشخصي (complete-profile)

```http
POST /api/provider/auth/complete-profile
Authorization: Bearer <token>
Content-Type: multipart/form-data

# Form Fields (Text)
name: محمد على
specialties: towing
experience: 10
bio: ونش إنقاذ وميكانيكي خبرة 10 سنوات
location[lat]: 31.0450
location[lng]: 31.3850
location[address]: المنصورة، شارع الجيش
serviceRange: 25
prices[towing]: 400

# Files
idCardFront: image.png
idCardBack: card-back.png
selfie: selfie.png
towLicenseFront: license-front.png
towLicenseBack: license-back.png
```

**الـ Response:**

```json
{
  "message": "Profile completed successfully. Waiting for admin approval.",
  "user": {
    "id": "6a36f20c71fe17277354bbb5",
    "name": "محمد على",
    "phone": "01123345687",
    "specialties": ["towing"],
    "experience": 10,
    "bio": "ونش إنقاذ وميكانيكي خبرة 10 سنوات",
    "location": {
      "lat": 31.045,
      "lng": 31.385,
      "address": "المنصورة، شارع الجيش"
    },
    "serviceRange": 25,
    "prices": {
      "towing": 400
    },
    "documents": {
      "idCardFront": "image.png",
      "idCardBack": "card-back.png",
      "selfie": "selfie.png",
      "towLicenseFront": "license-front.png",
      "towLicenseBack": "license-back.png"
    },
    "isApproved": false,
    "isProfileComplete": true,
    "subscriptionStatus": "pending"
  }
}
```

### 2. تغيير حالة التوفر

```http
PATCH /api/provider/auth/availability
Authorization: Bearer <token>
Content-Type: application/json

{
  "isOnline": true
}
```

**الـ Response:**

```json
{
  "message": "You are now online",
  "isOnline": true
}
```

### 3. تفعيل الاشتراك

```http
POST /api/provider/subscription/activate
Authorization: Bearer <token>
Content-Type: application/json

{
  "plan": "premium",
  "durationDays": 30
}
```

**الـ Response:**

```json
{
  "message": "Subscription activated successfully",
  "subscription": {
    "status": "active",
    "plan": "premium",
    "startDate": "2026-06-21T00:00:00.000Z",
    "endDate": "2026-07-21T00:00:00.000Z"
  }
}
```

### 4. قبول طلب

```http
POST /api/provider/requests/:id/accept
Authorization: Bearer <token>
```

**الـ Response:**

```json
{
  "message": "Request accepted successfully",
  "request": {
    "id": "6a36f20c71fe17277354bbb5",
    "status": "accepted",
    "acceptedAt": "2026-06-21T10:00:00.000Z"
  }
}
```

### 5. رفض طلب مع سبب

```http
POST /api/provider/requests/:id/reject
Authorization: Bearer <token>
Content-Type: application/json

{
  "cancelReason": "distance_too_far"
}
```

**الـ Response:**

```json
{
  "message": "Request rejected successfully",
  "request": {
    "id": "6a36f20c71fe17277354bbb5",
    "status": "cancelled",
    "cancelReason": "distance_too_far"
  }
}
```

### 6. تحديث حالة الطلب

```http
PATCH /api/provider/requests/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "on_the_way"
}
```

**الـ Response:**

```json
{
  "message": "Request status updated successfully",
  "request": {
    "id": "6a36f20c71fe17277354bbb5",
    "status": "on_the_way"
  }
}
```

---

## ⏱️ آلية الطلب والمهلة (Timeout)

- الطلب ينشأ بحالة `pending`.
- مقدم الخدمة لديه **15 ثانية** ليقوم بقبوله (عبر `accept`).
- إذا انقضت 15 ثانية دون قبول، تتحول الحالة تلقائياً إلى `timeout` (لا يمكن قبوله بعد ذلك).
- يتم التحقق من المهلة تلقائياً عند محاولة قبول الطلب.

---

## ⭐ التقييمات (Rating)

- بعد أن يصبح الطلب `completed`، يمكن للعميل (عبر Customer API) إرسال تقييم (1-5 نجوم + تعليق اختياري).
- يتم تحديث متوسط تقييم مقدم الخدمة (`rating`) وعدد التقييمات (`totalRatings`) في نموذج `ProviderUser`.

---

## 🚀 إعداد وتشغيل المشروع

### 1. استنساخ المشروع

```bash
git clone https://github.com/Mohamedmnem11/provider.git
cd provider
```

### 2. تثبيت الحزم

```bash
npm install
```

### 3. إعداد ملف `.env`

```env
PORT=3002
MONGO_URI=mongodb://localhost:27017/mech-rescue-provider
JWT_SECRET=your_super_secret_key_here
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 4. تشغيل السيرفر

```bash
# للتطوير
nodemon server

# للإنتاج
node server
```

### 5. إضافة بيانات تجريبية (seed)

```bash
node seed.js
```

سينشئ مقدم خدمة (`01010000001`) وثلاثة طلبات تجريبية.

---

## ✅ ما تم إنجازه بالكامل في هذا التطبيق

| الميزة | الحالة |
|--------|--------|
| تسجيل/دخول بـ OTP (محاكاة) | ✅ |
| إدارة الملف الشخصي (اسم، تخصصات، موقع، صور، أسعار للونش) | ✅ |
| رفع صور البطاقة (idCardFront, idCardBack) | ✅ |
| رفع صور شخصية (selfie) | ✅ |
| رفع صور رخصة الونش (towLicenseFront, towLicenseBack) | ✅ |
| Parsing تلقائي للـ Form-Data (specialties, location, prices) | ✅ |
| نظام الاشتراكات (تفعيل، تجديد، صلاحية) | ✅ |
| تغيير حالة التوفر (Online/Offline) | ✅ |
| استقبال الطلبات الواردة (مع بيانات العميل، الموقع، الوجهة، وصف المشكلة، تقديرات) | ✅ |
| قبول/رفض الطلبات مع أسباب الإلغاء | ✅ |
| مهلة 15 ثانية (timeout) | ✅ |
| تحديث حالة الطلب (accepted → on_the_way → in_progress → completed) | ✅ |
| التقييم (rating) والتحديث التلقائي لمتوسط التقييم | ✅ |
| قاعدة بيانات جاهزة (Models) | ✅ |
| إدارة خدمات إضافية (اختياري) | ✅ |
| توثيق كامل (README) | ✅ |

---

## ⚠️ ملاحظات – ما لم ينجز بعد

- **رفع الصور حقيقياً** إلى Cloudinary (يتم حالياً تخزين `filename` فقط – سهل التكامل لاحقاً).
- **إرسال OTP حقيقي** عبر WhatsApp Cloud API أو Twilio (محاكاة `console.log` حالياً).
- **Admin Panel** لقبول مقدمي الخدمة (`isApproved`) ومراجعة المستندات.
- **واجهة المستخدم (UI)** لتطبيق مقدم الخدمة (React Native / Flutter).
- **إشعارات فورية (Push Notifications)** للطلبات الجديدة.
- **تتبع الموقع في الوقت الفعلي (Real-time tracking)**.

---