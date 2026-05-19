require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { authMiddleware } = require('./authMiddleware');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(authMiddleware);

// Routes
const authRouter = require('./routes/auth');
const restaurantsRouter = require('./routes/restaurants');
const queuesRouter = require('./routes/queues');
const ordersRouter = require('./routes/orders');
const paymentsRouter = require('./routes/payments');
const reviewsRouter = require('./routes/reviews');
const reviewTagsRouter = require('./routes/reviewTags');
const rewardsRouter = require('./routes/rewards');
const adminRouter = require('./routes/admin');
const tableQrRouter = require('./routes/tableQr');

app.use('/v1/auth', authRouter);
app.use('/v1/restaurants', restaurantsRouter);
app.use('/v1/queues', queuesRouter);
app.use('/v1/orders', ordersRouter);
app.use('/v1/payments', paymentsRouter);
app.use('/v1/reviews', reviewsRouter);
app.use('/v1/review-tags', reviewTagsRouter);
app.use('/v1/rewards', rewardsRouter);
app.use('/v1/admin', adminRouter);
app.use('/v1/table-qr', tableQrRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', timestamp: new Date() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

app.listen(PORT, () => {
  console.log(`CariMakan API server is running on http://localhost:${PORT}`);
});
