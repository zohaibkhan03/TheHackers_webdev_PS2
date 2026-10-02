// ─── src/server.ts ──────────────────────────────────────────────────────────────

import app from './app';
import { env } from './config/env';
import { prisma } from './lib/prisma';

async function bootstrap() {
  try {
    // Verify database connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    // Start server
    const server = app.listen(env.PORT, () => {
      console.log(`🚀 Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
    });

    // Graceful shutdown
    const shutdown = async () => {
      console.log('\nShutting down server...');
      server.close();
      await prisma.$disconnect();
      console.log('Server and database connections closed.');
      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap();
