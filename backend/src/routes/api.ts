import { Router } from 'express';
import { getFeed, getArticleDetails, triggerIngestion } from '../controllers/newsController';
import { getClusters, getClusterDetails, syncClustersManually } from '../controllers/clusterController';
import { analyzeCustomText, getBlindspots } from '../controllers/biasController';
import { askNewsAssistant } from '../controllers/assistantController';
import {
  register,
  login,
  getCurrentUser,
  updatePreferences,
  toggleBookmark,
  getPersonalizedFeed
} from '../controllers/authController';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';

const router = Router();

// Public News & Clusters
router.get('/news/feed', getFeed);
router.get('/news/articles/:id', getArticleDetails);
router.get('/news/clusters', getClusters);
router.get('/news/clusters/:id', getClusterDetails);

// Bias & Blindspots
router.post('/bias/analyze', analyzeCustomText);
router.get('/news/blindspots', getBlindspots);

// AI Assistant
router.post('/assistant/ask', askNewsAssistant);

// Authentication Endpoints
router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/auth/me', authenticateToken as any, getCurrentUser as any);
router.put('/auth/preferences', authenticateToken as any, updatePreferences as any);
router.post('/auth/bookmarks', authenticateToken as any, toggleBookmark as any);

// Personalized Feed (Protected)
router.get('/news/feed/personalized', authenticateToken as any, getPersonalizedFeed as any);

// Ingestion & Clustering Sync (Protected with Role Authorization: Admins & Editors)
router.post('/news/ingest', triggerIngestion);
router.post('/news/clusters/sync', syncClustersManually);

export default router;
