import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import workflowRoutes from './routes/workflow.route.js';
import authRoutes from './routes/auth.route.js';

import { runMigrations } from './db/migrate.js';

const app = new Hono();

// Run migrations
await runMigrations();

// Middleware
app.use('*', logger());
app.use('*', cors());

// Health check endpoint
app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.route('/api/auth', authRoutes);
app.route('/api/workflow', workflowRoutes);

// 404 handler
app.notFound((c) => {
  return c.json(
    {
      success: false,
      error: 'Route not found',
    },
    404
  );
});

// Error handler
app.onError((err, c) => {
  console.error('Unhandled error:', err);
  return c.json(
    {
      success: false,
      error: 'Internal server error',
      message: err.message,
    },
    500
  );
});

const port = Number(process.env.PORT) || 8080;

console.log(`🚀 Server starting on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});

export default app;