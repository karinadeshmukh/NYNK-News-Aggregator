import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRouter from './routes/api';
import { connectDB } from './config/db';
import { newsIngestionService } from './services/newsIngestionService';
import { clusterSyncService } from './services/clusterSyncService';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: '*' }));
app.use(express.json());

// Routes
app.use('/api', apiRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'NYNK News Intelligence Backend Gateway',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Root & API welcome endpoints for browser visitors
app.get(['/', '/api'], (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>NYNK Backend API Gateway</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #FAF7F2; color: #1e293b; padding: 40px; line-height: 1.6; }
          .card { background: white; max-width: 650px; margin: 0 auto; padding: 30px; border-radius: 20px; border: 2px solid #0f172a; box-shadow: 4px 4px 0px rgba(15,23,42,0.85); }
          h1 { margin-top: 0; font-size: 26px; }
          .badge { display: inline-block; padding: 4px 10px; border-radius: 999px; background: #DCFCE7; color: #166534; font-size: 12px; font-weight: bold; border: 1px solid #86EFAC; margin-bottom: 15px; }
          ul { padding-left: 20px; }
          li { margin-bottom: 8px; }
          a { color: #4338ca; font-weight: bold; text-decoration: underline; }
          .btn { display: inline-block; padding: 10px 20px; background: #0f172a; color: white; border-radius: 999px; text-decoration: none; font-size: 13px; font-weight: bold; margin-top: 15px; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="badge">● Backend Online & Healthy</div>
          <h1>NYNK API Gateway</h1>
          <p>Welcome to the REST API for NYNK – News You Need to Know.</p>
          <p><strong>Active REST Endpoints:</strong></p>
          <ul>
            <li><a href="/api/news/clusters" target="_blank">/api/news/clusters</a> – Clustered news stories with multi-perspective breakdowns</li>
            <li><a href="/api/news/feed" target="_blank">/api/news/feed</a> – Aggregated raw articles feed</li>
            <li><a href="/api/news/blindspots" target="_blank">/api/news/blindspots</a> – Media coverage blindspot detector</li>
            <li><a href="/health" target="_blank">/health</a> – System health & status</li>
          </ul>
          <a class="btn" href="http://localhost:3000" target="_blank">Open Next.js Frontend (http://localhost:3000) →</a>
        </div>
      </body>
    </html>
  `);
});

export const startServer = async () => {
  try {
    // 1. Connect DB or fallback to Memory Store
    await connectDB();

    // 2. Seed initial multi-perspective news if not already present
    await newsIngestionService.seedInitialMultiPerspectiveNews();

    // 3. Run initial clustering & blindspot detection
    await clusterSyncService.syncClusters();
  } catch (err: any) {
    console.warn('[NYNK Server] Initialization notice:', err.message);
  }

  // 4. Start listening
  const server = app.listen(PORT, () => {
    console.log(`[NYNK Server] Running on http://localhost:${PORT}`);
  });

  return server;
};

process.on('uncaughtException', (err) => {
  console.error('[NYNK Server] Uncaught Exception:', err.message);
});

process.on('unhandledRejection', (reason: any) => {
  console.error('[NYNK Server] Unhandled Rejection:', reason?.message || reason);
});

if (require.main === module) {
  startServer().catch((err) => {
    console.error('[NYNK Server] Startup failed:', err);
  });
}

export default app;
