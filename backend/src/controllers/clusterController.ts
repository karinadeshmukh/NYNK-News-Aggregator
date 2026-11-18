import { Request, Response } from 'express';
import { store } from '../services/store';
import { clusterSyncService } from '../services/clusterSyncService';

export const getClusters = async (req: Request, res: Response) => {
  try {
    const { topic, minDiversity, limit } = req.query;
    const clusters = await store.getClusters({
      topic: topic ? String(topic) : undefined,
      minDiversity: minDiversity ? parseFloat(String(minDiversity)) : undefined,
      limit: limit ? parseInt(String(limit), 10) : 30
    });

    res.json({
      success: true,
      count: clusters.length,
      clusters
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getClusterDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const cluster = await store.getClusterById(id);
    if (!cluster) {
      return res.status(404).json({ success: false, error: 'Cluster not found' });
    }

    // Fetch the detailed articles associated with this cluster
    const articles = await store.getArticles({ cluster_id: cluster.cluster_id });

    res.json({
      success: true,
      cluster,
      articles
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const syncClustersManually = async (req: Request, res: Response) => {
  try {
    const count = await clusterSyncService.syncClusters();
    res.json({
      success: true,
      message: `Successfully clustered and synchronized ${count} stories.`
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

