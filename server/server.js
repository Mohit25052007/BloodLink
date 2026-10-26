import dotenv from 'dotenv';
import app from './app.js';
import { connectDB } from './config/db.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB().then(() => {
  const server = app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`  🩸 BloodLink Backend Server Active`);
    console.log(`  🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`  🚀 API URL:     http://localhost:${PORT}/api`);
    console.log(`  🏥 Health:      http://localhost:${PORT}/api/health`);
    console.log(`=======================================================`);
  });

  // Graceful shutdown handling
  const handleExit = (signal) => {
    console.log(`\nReceived ${signal}. Gracefully terminating BloodLink server...`);
    server.close(() => {
      console.log('HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => handleExit('SIGTERM'));
  process.on('SIGINT', () => handleExit('SIGINT'));
});

// Global error traps for unhandled events
process.on('unhandledRejection', (reason, promise) => {
  console.error('[Unhandled Rejection at Promise]', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('[Uncaught Exception]', error);
});
