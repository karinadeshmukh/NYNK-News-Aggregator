import mongoose, { Document, Schema } from 'mongoose';

export interface IPerspectiveBreakdown {
  left_count: number;
  center_count: number;
  right_count: number;
  official_count: number;
  dominant_perspective: string;
}

export interface IPerspectiveSummaryDetail {
  perspective: string;
  angle: string;
  articles_quoted: string[];
}

export interface ICluster extends Document {
  cluster_id: string;
  title: string;
  representative_article_id: string;
  article_ids: string[];
  perspectives: IPerspectiveBreakdown;
  diversity_score: number;
  blindspot_detected?: string;
  consensus_summary?: string;
  key_facts: string[];
  perspective_breakdown?: IPerspectiveSummaryDetail[];
  coverage_divergence?: string;
  topic?: string;
  image_url?: string;
  created_at: Date;
  updated_at: Date;
}

const ClusterSchema = new Schema<ICluster>({
  cluster_id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  representative_article_id: { type: String, required: true },
  article_ids: [{ type: String }],
  perspectives: {
    left_count: { type: Number, default: 0 },
    center_count: { type: Number, default: 0 },
    right_count: { type: Number, default: 0 },
    official_count: { type: Number, default: 0 },
    dominant_perspective: { type: String, default: 'Neutral/Balanced' }
  },
  diversity_score: { type: Number, default: 0.0 },
  blindspot_detected: { type: String },
  consensus_summary: { type: String },
  key_facts: [{ type: String }],
  perspective_breakdown: [
    {
      perspective: { type: String },
      angle: { type: String },
      articles_quoted: [{ type: String }]
    }
  ],
  coverage_divergence: { type: String },
  topic: { type: String, default: 'General' },
  image_url: { type: String, default: '' },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

export const Cluster = mongoose.models.Cluster || mongoose.model<ICluster>('Cluster', ClusterSchema);

