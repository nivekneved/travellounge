const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
// Database initialized via Supabase Client (Lazy)
// MongoDB removed in favor of Supabase Native Architecture


const app = express();

// Security Middleware
app.use(helmet());

const corsOptions = {
    origin: process.env.NODE_ENV === 'production'
        ? [process.env.FRONTEND_URL, process.env.ADMIN_URL, 'https://travellounge.mu', 'https://admin.travellounge.mu'].filter(Boolean)
        : '*',
    credentials: true,
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(logger('dev'));

// Rate Limiting
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // stricter limit for auth
    message: { message: 'Too many requests from this IP, please try again after 15 minutes' }
});

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});

app.use('/api/admin/login', authLimiter);
app.use('/api/auth/', authLimiter);
app.use('/api/', apiLimiter);

// Routes
const indexRouter = require('./routes/index');
const adminRouter = require('./routes/admin');
const serviceRouter = require('./routes/services');
const bookingRouter = require('./routes/bookings');
const reviewRouter = require('./routes/reviews');
const flightRouter = require('./routes/flights');
const miscRouter = require('./routes/misc');
const menuRouter = require('./routes/menus');
const promotionRouter = require('./routes/promotions');
const heroRouter = require('./routes/hero');
const initCronJobs = require('./config/cron');

app.use('/', indexRouter); // Keep the root route
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/admin', adminRouter);
app.use('/api/services', serviceRouter);
app.use('/api/bookings', bookingRouter);
app.use('/api/reviews', reviewRouter);
app.use('/api/flights', flightRouter);
app.use('/api/menus', menuRouter);
app.use('/api/promotions', promotionRouter);
app.use('/api/hero', heroRouter);
app.use('/api/misc', miscRouter);

// Initialize Cron Jobs
initCronJobs();

// Error Handling
app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

module.exports = app;

if (require.main === module) {
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`Backend server listening on port ${port}`);
    });
}
