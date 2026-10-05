require('dotenv').config({ quiet: true });
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const app = require('./app');

const startServer = async () => {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not configured');
  if (process.env.NODE_ENV === 'production' && !process.env.CUSTOMER_ORIGIN) {
    throw new Error('CUSTOMER_ORIGIN is not configured');
  }
  await connectDB();
  return new Promise((resolve, reject) => {
    const server = app.listen(process.env.PORT || 5000, () => {
      console.log('Server started; MongoDB connected');
      resolve(server);
    });
    server.once('error', reject);
  });
};

if (require.main === module) {
  startServer().catch(async (err) => {
    // Strip any embedded credentials or URIs before logging
    const raw = (err && err.message) ? err.message : String(err);
    const safe = raw.replace(/mongodb(\+srv)?:\/\/[^\s]+/gi, '[REDACTED_URI]');
    console.error('Server startup failed. Check environment configuration and database access.');
    console.error('[startup] name   :', err && err.name ? err.name : 'Error');
    console.error('[startup] code   :', err && err.code ? err.code : 'none');
    console.error('[startup] reason :', safe);
    if (err && err.stack) {
      // Print only the first two lines of the stack (location only, no args)
      const location = err.stack.split('\n').slice(1, 3).join(' | ');
      console.error('[startup] at     :', location);
    }
    await mongoose.disconnect();
    process.exitCode = 1;
  });
}

module.exports = { startServer };
