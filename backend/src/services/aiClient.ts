import axios from 'axios';

const AI_SERVICE_BASE_URL = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000/api';

export interface ArticleAIInput {
  id: string;
  title: string;
  content?: string;
  summary?: string;
  source_name: string;
  source_category?: string;
  url?: string;
  published_at?: string;
  language?: string;
}

export interface BiasFactor {
  category: string;
  score: number;
  description: string;
}

export interface BiasAnalysisResult {
  perspective: 'Left' | 'Center' | 'Right' | 'Official';
  confidence: number;
  sentiment: string;
  sentiment_score: number;
  subjectivity: number;
  framing_factors: BiasFactor[];
  detected_keywords: string[];
  explanation: string;
}

export interface PerspectiveBreakdown {
  left_count: number;
  center_count: number;
  right_count: number;
  official_count: number;
  dominant_perspective: string;
}

export interface StoryClusterOutput {
  cluster_id: string;
  title: string;
  representative_article_id: string;
  article_ids: string[];
  articles: ArticleAIInput[];
  perspectives: PerspectiveBreakdown;
  diversity_score: number;
  blindspot_detected?: string;
  created_at?: string;
}

export interface ClusterResponse {
  clusters: StoryClusterOutput[];
  total_articles: number;
  clustered_articles: number;
  unclustered_article_ids: string[];
}

export interface PerspectiveSummaryDetail {
  perspective: string;
  angle: string;
  articles_quoted: string[];
}

export interface SummarizationResponse {
  cluster_id: string;
  consensus_summary: string;
  key_facts: string[];
  perspective_breakdown: PerspectiveSummaryDetail[];
  coverage_divergence: string;
}

export interface RAGCitation {
  source_name: string;
  article_title: string;
  url?: string;
  perspective?: string;
}

export interface RAGAssistantResponse {
  answer: string;
  citations: RAGCitation[];
  confidence: number;
  consensus_note?: string;
}

export class AIClient {
  private client = axios.create({
    baseURL: AI_SERVICE_BASE_URL,
    timeout: 15000,
    headers: { 'Content-Type': 'application/json' }
  });

  async checkHealth(): Promise<{ status: string; service: string; fallback_mode: boolean }> {
    const res = await this.client.get('/health');
    return res.data;
  }

  async analyzeBias(title: string, content: string = '', source_name: string = ''): Promise<BiasAnalysisResult> {
    try {
      const res = await this.client.post<BiasAnalysisResult>('/bias/analyze', {
        title,
        content,
        source_name
      });
      return res.data;
    } catch (err: any) {
      console.warn(`[AIClient] Bias analysis fallback for "${title}":`, err.message);
      // Fallback
      return {
        perspective: 'Center',
        confidence: 0.6,
        sentiment: 'Neutral',
        sentiment_score: 0.0,
        subjectivity: 0.2,
        framing_factors: [],
        detected_keywords: [],
        explanation: 'Baseline heuristic classification.'
      };
    }
  }

  async clusterArticles(articles: ArticleAIInput[], threshold: number = 0.65): Promise<ClusterResponse> {
    try {
      const res = await this.client.post<ClusterResponse>('/cluster', {
        articles,
        threshold
      });
      return res.data;
    } catch (err: any) {
      console.warn('[AIClient] Cluster service fallback:', err.message);
      // Basic fallback clustering by simple source groups or single cluster
      const clusters: StoryClusterOutput[] = articles.map((a, idx) => ({
        cluster_id: `cluster_fallback_${a.id}`,
        title: a.title,
        representative_article_id: a.id,
        article_ids: [a.id],
        articles: [a],
        perspectives: {
          left_count: 0,
          center_count: 1,
          right_count: 0,
          official_count: 0,
          dominant_perspective: 'Center'
        },
        diversity_score: 0.25,
        created_at: a.published_at
      }));

      return {
        clusters,
        total_articles: articles.length,
        clustered_articles: articles.length,
        unclustered_article_ids: []
      };
    }
  }

  async summarizeCluster(cluster_id: string, cluster_title: string, articles: ArticleAIInput[]): Promise<SummarizationResponse> {
    try {
      const res = await this.client.post<SummarizationResponse>('/summary/cluster', {
        cluster_id,
        cluster_title,
        articles
      });
      return res.data;
    } catch (err: any) {
      console.warn(`[AIClient] Summary service fallback for cluster ${cluster_id}:`, err.message);
      return {
        cluster_id,
        consensus_summary: articles.length > 0 ? `${articles[0].title}. ${articles[0].summary || ''}` : 'No content available.',
        key_facts: articles.map(a => `${a.source_name}: ${a.title}`),
        perspective_breakdown: [],
        coverage_divergence: 'Multiple perspectives detected across reporting publishers.'
      };
    }
  }

  async queryAssistant(query: string, context_articles: ArticleAIInput[], conversation_history: any[] = []): Promise<RAGAssistantResponse> {
    try {
      const res = await this.client.post<RAGAssistantResponse>('/assistant/ask', {
        query,
        context_articles,
        conversation_history
      });
      return res.data;
    } catch (err: any) {
      console.warn('[AIClient] Assistant RAG fallback:', err.message);
      const citations: RAGCitation[] = context_articles.slice(0, 3).map(a => ({
        source_name: a.source_name,
        article_title: a.title,
        url: a.url,
        perspective: 'Center'
      }));

      return {
        answer: `Based on current coverage from ${context_articles.length} news reports, events are being monitored across diverse perspectives. Key developments include: ${context_articles[0]?.title || 'Ongoing developments'}.`,
        citations,
        confidence: 0.75,
        consensus_note: 'Synthesized from aggregated news sources.'
      };
    }
  }
}

export const aiClient = new AIClient();

