import { Article, IArticle } from '../models/Article';
import { Cluster, ICluster } from '../models/Cluster';
import { Blindspot, IBlindspot } from '../models/Blindspot';
import { User, IUser } from '../models/User';
import { isConnected } from '../config/db';

class MemoryStore {
  articles: IArticle[] = [];
  clusters: ICluster[] = [];
  blindspots: IBlindspot[] = [];
  users: IUser[] = [];

  // Articles
  async saveArticle(articleData: any): Promise<IArticle> {
    if (isConnected) {
      return await Article.findOneAndUpdate(
        { id: articleData.id },
        { $set: articleData },
        { upsert: true, new: true }
      );
    }
    const idx = this.articles.findIndex((a) => a.id === articleData.id);
    if (idx >= 0) {
      this.articles[idx] = { ...this.articles[idx], ...articleData };
      return this.articles[idx];
    }
    const newArt = { ...articleData, created_at: new Date() } as IArticle;
    this.articles.push(newArt);
    return newArt;
  }

  async getArticles(query: { cluster_id?: string; perspective?: string; limit?: number } = {}): Promise<IArticle[]> {
    if (isConnected) {
      const mongoQuery: any = {};
      if (query.cluster_id) mongoQuery.cluster_id = query.cluster_id;
      if (query.perspective) mongoQuery.perspective = query.perspective;
      return await Article.find(mongoQuery).sort({ published_at: -1 }).limit(query.limit || 100);
    }
    let res = [...this.articles];
    if (query.cluster_id) {
      res = res.filter((a) => a.cluster_id === query.cluster_id);
    }
    if (query.perspective) {
      res = res.filter((a) => a.perspective === query.perspective);
    }
    res.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
    return res.slice(0, query.limit || 100);
  }

  async getArticleById(id: string): Promise<IArticle | null> {
    if (isConnected) {
      return await Article.findOne({ id });
    }
    return this.articles.find((a) => a.id === id) || null;
  }

  // Clusters
  async saveCluster(clusterData: any): Promise<ICluster> {
    if (isConnected) {
      return await Cluster.findOneAndUpdate(
        { cluster_id: clusterData.cluster_id },
        { $set: clusterData },
        { upsert: true, new: true }
      );
    }
    const idx = this.clusters.findIndex((c) => c.cluster_id === clusterData.cluster_id);
    if (idx >= 0) {
      this.clusters[idx] = { ...this.clusters[idx], ...clusterData, updated_at: new Date() };
      return this.clusters[idx];
    }
    const newCluster = { ...clusterData, created_at: new Date(), updated_at: new Date() } as ICluster;
    this.clusters.push(newCluster);
    return newCluster;
  }

  async getClusters(query: { topic?: string; minDiversity?: number; limit?: number } = {}): Promise<ICluster[]> {
    if (isConnected) {
      const mongoQuery: any = {};
      if (query.topic && query.topic !== 'All') mongoQuery.topic = query.topic;
      if (query.minDiversity) mongoQuery.diversity_score = { $gte: query.minDiversity };
      return await Cluster.find(mongoQuery).sort({ diversity_score: -1, updated_at: -1 }).limit(query.limit || 50);
    }
    let res = [...this.clusters];
    if (query.topic && query.topic !== 'All') {
      res = res.filter((c) => c.topic?.toLowerCase() === query.topic?.toLowerCase());
    }
    if (query.minDiversity) {
      res = res.filter((c) => c.diversity_score >= (query.minDiversity || 0));
    }
    res.sort((a, b) => (b.diversity_score || 0) - (a.diversity_score || 0) || new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime());
    return res.slice(0, query.limit || 50);
  }

  async getClusterById(cluster_id: string): Promise<ICluster | null> {
    if (isConnected) {
      return await Cluster.findOne({ cluster_id });
    }
    return this.clusters.find((c) => c.cluster_id === cluster_id) || null;
  }

  // Blindspots
  async saveBlindspot(blindspotData: any): Promise<IBlindspot> {
    if (isConnected) {
      return await Blindspot.findOneAndUpdate(
        { cluster_id: blindspotData.cluster_id, missing_perspective: blindspotData.missing_perspective },
        { $set: blindspotData },
        { upsert: true, new: true }
      );
    }
    const idx = this.blindspots.findIndex(
      (b) => b.cluster_id === blindspotData.cluster_id && b.missing_perspective === blindspotData.missing_perspective
    );
    if (idx >= 0) {
      this.blindspots[idx] = { ...this.blindspots[idx], ...blindspotData };
      return this.blindspots[idx];
    }
    const newB = { ...blindspotData, created_at: new Date() } as IBlindspot;
    this.blindspots.push(newB);
    return newB;
  }

  async getBlindspots(limit: number = 20): Promise<IBlindspot[]> {
    if (isConnected) {
      return await Blindspot.find().sort({ created_at: -1 }).limit(limit);
    }
    return [...this.blindspots].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, limit);
  }

  // Users
  async findUserByEmail(email: string): Promise<IUser | null> {
    const cleanEmail = email.toLowerCase().trim();
    if (isConnected) {
      return await User.findOne({ email: cleanEmail });
    }
    return this.users.find((u) => u.email.toLowerCase() === cleanEmail) || null;
  }

  async createUser(userData: any): Promise<IUser> {
    userData.email = userData.email.toLowerCase().trim();
    if (isConnected) {
      return await User.create(userData);
    }
    const newUser = { ...userData, created_at: new Date() } as IUser;
    this.users.push(newUser);
    return newUser;
  }

  async updateUser(email: string, updates: Partial<IUser>): Promise<IUser | null> {
    const cleanEmail = email.toLowerCase().trim();
    if (isConnected) {
      return await User.findOneAndUpdate({ email: cleanEmail }, { $set: updates }, { new: true });
    }
    const idx = this.users.findIndex((u) => u.email.toLowerCase() === cleanEmail);
    if (idx >= 0) {
      Object.assign(this.users[idx], updates);
      return this.users[idx];
    }
    return null;
  }
}

export const store = new MemoryStore();

