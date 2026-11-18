import mongoose, { Document, Schema } from 'mongoose';

export type UserRole = 'reader' | 'editor' | 'admin';

export interface IUser extends Document {
  email: string;
  name: string;
  password_hash: string;
  role: UserRole;
  preferred_topics: string[];
  preferred_perspectives: string[];
  bookmarked_cluster_ids: string[];
  created_at: Date;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  name: { type: String, required: true, trim: true },
  password_hash: { type: String, required: true },
  role: { type: String, enum: ['reader', 'editor', 'admin'], default: 'reader' },
  preferred_topics: [{ type: String }],
  preferred_perspectives: [{ type: String }],
  bookmarked_cluster_ids: [{ type: String }],
  created_at: { type: Date, default: Date.now }
});

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
