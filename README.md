# 🚀 Mech Rescue Provider Backend

Backend API for service providers in the Mech Rescue platform. This service enables providers to register using OTP authentication, manage their profiles, handle incoming service requests, manage subscriptions, and receive customer ratings.

---

## ✨ Features

* 🔐 OTP Authentication
* 👤 Provider Profile Management
* 📍 Location & Service Coverage Management
* 🚚 Towing & Roadside Assistance Services
* 💳 Subscription Management
* 📥 Incoming Requests Handling
* 🟢 Online / Offline Availability
* ⭐ Ratings & Reviews System
* 📸 Document & Image Uploads
* ⏱️ Request Timeout Handling

---

## 🛠️ Tech Stack

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT Authentication
* Multer
* Cloudinary (Planned)
* REST API Architecture

---

## 📁 Project Structure

```text
provider-backend/
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── utils/
├── server.js
├── seed.js
├── package.json
└── .env
```

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3002

MONGO_URI=

JWT_SECRET=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

---

## 🚀 Installation

Clone the repository:

```bash
git clone https://github.com/Mohamedmnem11/provider.git

cd provider-backend
```

Install dependencies:

```bash
npm install
```

---

## ▶️ Running the Application

Development:

```bash
npm run dev
```

or

```bash
nodemon server
```

Production:

```bash
npm start
```

or

```bash
node server
```

---

## 🌐 API Base URL

```text
http://localhost:3002/api/provider
```

---

## 🔐 Authentication Endpoints

| Method | Endpoint               | Description                |
| ------ | ---------------------- | -------------------------- |
| POST   | /auth/send-otp         | Send verification code     |
| POST   | /auth/verify-otp       | Verify OTP and login       |
| GET    | /auth/profile          | Get provider profile       |
| PUT    | /auth/profile          | Update profile             |
| POST   | /auth/complete-profile | Complete profile           |
| PATCH  | /auth/availability     | Change availability status |

---

## 💳 Subscription Endpoints

| Method | Endpoint               | Description             |
| ------ | ---------------------- | ----------------------- |
| POST   | /subscription/activate | Activate subscription   |
| GET    | /subscription/status   | Get subscription status |
| POST   | /subscription/renew    | Renew subscription      |

---

## 🛠️ Services Endpoints

| Method | Endpoint      | Description      |
| ------ | ------------- | ---------------- |
| POST   | /services     | Create service   |
| GET    | /services     | Get all services |
| PUT    | /services/:id | Update service   |
| DELETE | /services/:id | Delete service   |

---

## 📥 Requests Endpoints

| Method | Endpoint             | Description               |
| ------ | -------------------- | ------------------------- |
| GET    | /requests            | Get all assigned requests |
| GET    | /requests/:id        | Get request details       |
| POST   | /requests/:id/accept | Accept request            |
| POST   | /requests/:id/reject | Reject request            |
| PATCH  | /requests/:id/status | Update request status     |

---

## 👤 Provider Profile

Each provider can manage:

* Personal Information
* Service Specialties
* Service Area Coverage
* Pricing Information
* Experience & Bio
* Identity Verification Documents
* Towing License Documents
* Availability Status

Supported specialties:

```text
mechanic
towing
electrician
tire
workshop
battery
fuel
```

---

## ⏱️ Request Lifecycle

```text
pending
   ↓
accepted
   ↓
on_the_way
   ↓
in_progress
   ↓
completed
```

Additional statuses:

```text
cancelled
timeout
rated
```

Providers have 15 seconds to accept a request before it automatically becomes:

```text
timeout
```

---

## ⭐ Rating System

After a request is completed, customers can:

* Submit ratings (1–5 stars)
* Leave optional reviews

The provider's:

* Average Rating
* Total Ratings

are automatically updated.

---

## 🌱 Seed Data

Generate test data:

```bash
node seed.js
```

This will create:

* Test Provider Account
* Sample Requests
* Mock Data for Development

---

## 📌 Current Status

### Completed

* OTP Authentication
* Provider Registration
* Profile Management
* Subscription Management
* Availability Management
* Request Handling
* Request Status Tracking
* Rating System
* File Upload Support
* MongoDB Integration
* JWT Authentication

### Planned

* Cloudinary Integration
* Real SMS Provider
* Admin Dashboard
* Push Notifications
* Real-Time Tracking
* Payment Gateway Integration
* Analytics Dashboard

---

## 🗺️ Roadmap

* [ ] Cloudinary Uploads
* [ ] WhatsApp/Twilio OTP
* [ ] Admin Approval System
* [ ] Push Notifications
* [ ] Live Location Tracking
* [ ] Online Payments
* [ ] Provider Analytics

---

## 👨‍💻 Author

Mohamed Abdelmonem

GitHub:
https://github.com/Mohamedmnem11

---

## 📄 License

This project is licensed under the MIT License.
