import { Request, Response } from 'express';
import { aiClient, ArticleAIInput } from '../services/aiClient';
import { store } from '../services/store';

export const askNewsAssistant = async (req: Request, res: Response) => {
  try {
    const { query, cluster_id, conversation_history } = req.body;
    if (!query) {
      return res.status(400).json({ success: false, error: 'Query is required.' });
    }

    let articles: any[] = [];
    if (cluster_id) {
      articles = await store.getArticles({ cluster_id });
    } else {
      // Default to top recent articles for general news inquiries
      articles = await store.getArticles({ limit: 12 });
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

    const response = await aiClient.queryAssistant(query, aiInputs, conversation_history || []);

    res.json({
      success: true,
      answer: response.answer,
      citations: response.citations,
      confidence: response.confidence,
      consensus_note: response.consensus_note
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

