require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./src/config/database');

const app = express();

// الاتصال بقاعدة البيانات
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/provider/auth', require('./src/routes/authRoutes'));
app.use('/api/provider/services', require('./src/routes/serviceRoutes'));
app.use('/api/provider/requests', require('./src/routes/requestRoutes'));
app.use('/api/provider/subscription', require('./src/routes/subscriptionRoutes'));
// مسار تجريبي
app.get('/', (req, res) => {
  res.json({ message: 'Mech Rescue Provider API Running' });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`🚀 Provider server running on port ${PORT}`);
});