import { Request, Response } from 'express';
import { store } from '../services/store';
import { newsIngestionService } from '../services/newsIngestionService';
import { clusterSyncService } from '../services/clusterSyncService';

export const getFeed = async (req: Request, res: Response) => {
  try {
    const { perspective, limit } = req.query;
    const articles = await store.getArticles({
      perspective: perspective ? String(perspective) : undefined,
      limit: limit ? parseInt(String(limit), 10) : 50
    });

    res.json({
      success: true,
      count: articles.length,
      articles
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getArticleDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const article = await store.getArticleById(id);
    if (!article) {
      return res.status(404).json({ success: false, error: 'Article not found' });
    }
    res.json({ success: true, article });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const triggerIngestion = async (req: Request, res: Response) => {
  try {
    const count = await newsIngestionService.fetchLiveFeeds();
    const syncedClusters = await clusterSyncService.syncClusters();
    res.json({
      success: true,
      message: `Ingested ${count} new articles and refreshed ${syncedClusters} story clusters.`,
      new_articles: count,
      updated_clusters: syncedClusters
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

