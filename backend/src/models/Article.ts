import mongoose, { Document, Schema } from 'mongoose';

export interface IArticle extends Document {
  id: string;
  title: string;
  content: string;
  summary: string;
  source_name: string;
  source_category: string;
  url: string;
  published_at: Date;
  language: string;
  perspective: 'Left' | 'Center' | 'Right' | 'Official';
  cluster_id?: string;
  sentiment?: string;
  subjectivity?: number;
  detected_keywords?: string[];
  created_at: Date;
}

const ArticleSchema = new Schema<IArticle>({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  content: { type: String, default: '' },
  summary: { type: String, default: '' },
  source_name: { type: String, required: true },
  source_category: { type: String, default: 'Mainstream' },
  url: { type: String, default: '' },
  published_at: { type: Date, default: Date.now },
  language: { type: String, default: 'en' },
  perspective: { 
    type: String, 
    enum: ['Left', 'Center', 'Right', 'Official'],
    default: 'Center' 
  },
  cluster_id: { type: String, index: true },
  sentiment: { type: String },
  subjectivity: { type: Number },
  detected_keywords: [{ type: String }],
  created_at: { type: Date, default: Date.now }
});

export const Article = mongoose.models.Article || mongoose.model<IArticle>('Article', ArticleSchema);

