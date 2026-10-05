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
  startServer().catch(async () => {
    console.error('Server startup failed. Check database access, environment configuration, and port availability.');
    await mongoose.disconnect();
    process.exitCode = 1;
  });
}

module.exports = { startServer };
