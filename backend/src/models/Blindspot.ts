import mongoose, { Document, Schema } from 'mongoose';

export interface IBlindspot extends Document {
  cluster_id: string;
  cluster_title: string;
  missing_perspective: 'Left' | 'Right' | 'Center' | 'Official';
  severity: 'High' | 'Medium' | 'Low';
  message: string;
  coverage_ratios: {
    left: number;
    center: number;
    right: number;
    official: number;
  };
  created_at: Date;
}

const BlindspotSchema = new Schema<IBlindspot>({
  cluster_id: { type: String, required: true },
  cluster_title: { type: String, required: true },
  missing_perspective: {
    type: String,
    enum: ['Left', 'Right', 'Center', 'Official'],
    required: true
  },
  severity: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
  message: { type: String, required: true },
  coverage_ratios: {
    left: { type: Number, default: 0 },
    center: { type: Number, default: 0 },
    right: { type: Number, default: 0 },
    official: { type: Number, default: 0 }
  },
  created_at: { type: Date, default: Date.now }
});

export const Blindspot = mongoose.models.Blindspot || mongoose.model<IBlindspot>('Blindspot', BlindspotSchema);

