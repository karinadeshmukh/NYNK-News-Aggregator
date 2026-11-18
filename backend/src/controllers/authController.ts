import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { store } from '../services/store';
import { AuthRequest } from '../middleware/authMiddleware';
import { UserRole } from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'nynk-jwt-secret-dev-key-2026';

// Password Security
export const hashPassword = (password: string): string => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
};

export const verifyPassword = (password: string, storedHash: string): boolean => {
  if (!storedHash || !storedHash.includes(':')) {
    // Legacy / simple fallback comparison if needed
    return password === storedHash;
  }
  const [salt, originalHash] = storedHash.split(':');
  const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return originalHash === verifyHash;
};

export const register = async (req: Request, res: Response) => {
  try {
    const { email, name, password, role, preferred_topics, preferred_perspectives } = req.body;

    if (!email || !name || !password) {
      return res.status(400).json({ success: false, error: 'Email, name, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters long.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await store.findUserByEmail(cleanEmail);
    if (existing) {
      return res.status(400).json({ success: false, error: 'An account with this email already exists. Please sign in.' });
    }

    // Default first user to admin or check role
    const assignedRole: UserRole = (role === 'admin' || role === 'editor') ? role : 'reader';

    const newUser = await store.createUser({
      email: cleanEmail,
      name: name.trim(),
      password_hash: hashPassword(password),
      role: assignedRole,
      preferred_topics: preferred_topics || ['Technology', 'Economy', 'Governance'],
      preferred_perspectives: preferred_perspectives || ['Official', 'Left', 'Center', 'Right'],
      bookmarked_cluster_ids: []
    });

    const token = jwt.sign(
      { email: newUser.email, name: newUser.name, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token,
      user: {
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        preferred_topics: newUser.preferred_topics,
        preferred_perspectives: newUser.preferred_perspectives,
        bookmarked_cluster_ids: newUser.bookmarked_cluster_ids || []
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await store.findUserByEmail(cleanEmail);

    if (!user || !verifyPassword(password, user.password_hash)) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { email: user.email, name: user.name, role: user.role || 'reader' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Signed in successfully.',
      token,
      user: {
        email: user.email,
        name: user.name,
        role: user.role || 'reader',
        preferred_topics: user.preferred_topics || [],
        preferred_perspectives: user.preferred_perspectives || [],
        bookmarked_cluster_ids: user.bookmarked_cluster_ids || []
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getCurrentUser = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized.' });
    }

    const user = await store.findUserByEmail(req.user.email);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    res.json({
      success: true,
      user: {
        email: user.email,
        name: user.name,
        role: user.role || 'reader',
        preferred_topics: user.preferred_topics || [],
        preferred_perspectives: user.preferred_perspectives || [],
        bookmarked_cluster_ids: user.bookmarked_cluster_ids || []
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updatePreferences = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized.' });
    }

    const { preferred_topics, preferred_perspectives } = req.body;
    const updated = await store.updateUser(req.user.email, {
      preferred_topics,
      preferred_perspectives
    });

    res.json({
      success: true,
      message: 'Preferences updated successfully.',
      preferences: {
        preferred_topics: updated?.preferred_topics,
        preferred_perspectives: updated?.preferred_perspectives
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const toggleBookmark = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized.' });
    }

    const { cluster_id } = req.body;
    if (!cluster_id) {
      return res.status(400).json({ success: false, error: 'cluster_id is required.' });
    }

    const user = await store.findUserByEmail(req.user.email);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    let bookmarks = user.bookmarked_cluster_ids || [];
    const isBookmarked = bookmarks.includes(cluster_id);

    if (isBookmarked) {
      bookmarks = bookmarks.filter((id) => id !== cluster_id);
    } else {
      bookmarks.push(cluster_id);
    }

    await store.updateUser(user.email, { bookmarked_cluster_ids: bookmarks });

    res.json({
      success: true,
      is_bookmarked: !isBookmarked,
      bookmarked_cluster_ids: bookmarks
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getPersonalizedFeed = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized.' });
    }

    const user = await store.findUserByEmail(req.user.email);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    const allClusters = await store.getClusters({ limit: 50 });
    const userTopics = (user.preferred_topics || []).map((t) => t.toLowerCase());

    // Filter and score by user topic preference
    const matchedClusters = allClusters.filter((c) => {
      if (userTopics.length === 0) return true;
      return userTopics.includes((c.topic || 'General').toLowerCase());
    });

    res.json({
      success: true,
      user_preferences: {
        topics: user.preferred_topics,
        perspectives: user.preferred_perspectives
      },
      clusters: matchedClusters.length > 0 ? matchedClusters : allClusters
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
