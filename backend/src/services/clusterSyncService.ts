import { store } from './store';
import { aiClient, ArticleAIInput } from './aiClient';

export class ClusterSyncService {
  async syncClusters(): Promise<number> {
    const articles = await store.getArticles({ limit: 200 });
    if (!articles || articles.length === 0) {
      return 0;
    }

    const aiInputs: ArticleAIInput[] = articles.map((a) => ({
      id: a.id,
      title: a.title,
      content: a.content,
      summary: a.summary,
      source_name: a.source_name,
      source_category: a.source_category,
      url: a.url,
      published_at: a.published_at ? new Date(a.published_at).toISOString() : new Date().toISOString(),
      language: a.language
    }));

    // Cluster via AI Microservice
    const clusterRes = await aiClient.clusterArticles(aiInputs, 0.35);

    let updatedCount = 0;
    for (const cl of clusterRes.clusters) {
      // Summarize cluster
      const summaryRes = await aiClient.summarizeCluster(cl.cluster_id, cl.title, cl.articles);

      // Infer topic & image from constituent articles
      const firstArt = articles.find((a) => a.id === cl.representative_article_id);
      const topic = (firstArt as any)?.topic || 'General';
      const articleWithImg = cl.article_ids
        .map((id) => articles.find((a) => a.id === id))
        .find((a) => a && (a as any).image_url);
      const imageUrl = (articleWithImg as any)?.image_url || (firstArt as any)?.image_url || '';

      // Save or update Cluster
      await store.saveCluster({
        cluster_id: cl.cluster_id,
        title: cl.title,
        representative_article_id: cl.representative_article_id,
        article_ids: cl.article_ids,
        perspectives: cl.perspectives,
        diversity_score: cl.diversity_score,
        blindspot_detected: cl.blindspot_detected,
        consensus_summary: summaryRes.consensus_summary,
        key_facts: summaryRes.key_facts,
        perspective_breakdown: summaryRes.perspective_breakdown,
        coverage_divergence: summaryRes.coverage_divergence,
        topic,
        image_url: imageUrl
      });

      // Update cluster_id in articles
      for (const artId of cl.article_ids) {
        await store.saveArticle({ id: artId, cluster_id: cl.cluster_id });
      }

      // Check for blindspots
      const p = cl.perspectives;
      const totalSources = p.left_count + p.center_count + p.right_count + p.official_count;
      if (totalSources >= 2) {
        let missingPerspective: 'Left' | 'Right' | 'Center' | 'Official' | null = null;
        if (p.left_count === 0 && (p.right_count > 0 || p.official_count > 0)) {
          missingPerspective = 'Left';
        } else if (p.right_count === 0 && (p.left_count > 0 || p.official_count > 0)) {
          missingPerspective = 'Right';
        } else if (p.official_count === 0 && (p.left_count > 0 || p.right_count > 0)) {
          missingPerspective = 'Official';
        }

        if (missingPerspective) {
          await store.saveBlindspot({
            cluster_id: cl.cluster_id,
            cluster_title: cl.title,
            missing_perspective: missingPerspective,
            severity: totalSources >= 3 ? 'High' : 'Medium',
            message: `Story has extensive coverage in ${p.dominant_perspective} and peer outlets, but no notable reporting from ${missingPerspective} media.`,
            coverage_ratios: {
              left: p.left_count / totalSources,
              center: p.center_count / totalSources,
              right: p.right_count / totalSources,
              official: p.official_count / totalSources
            }
          });
        }
      }

      updatedCount++;
    }

    return updatedCount;
  }
}

export const clusterSyncService = new ClusterSyncService();

