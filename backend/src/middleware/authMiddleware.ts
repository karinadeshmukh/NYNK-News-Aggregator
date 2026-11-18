import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { store } from '../services/store';
import { UserRole } from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'nynk-jwt-secret-dev-key-2026';

export interface AuthenticatedUser {
  email: string;
  name: string;
  role: UserRole;
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required. Please sign in to access this resource.'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await store.findUserByEmail(decoded.email);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User session is invalid or user no longer exists.'
      });
    }

    req.user = {
      email: user.email,
      name: user.name,
      role: (user.role as UserRole) || 'reader'
    };

    next();
  } catch (err: any) {
    return res.status(403).json({
      success: false,
      error: 'Invalid or expired token. Please sign in again.'
    });
  }
};

export const requireRole = (allowedRoles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentication required.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Access denied. Requires one of [${allowedRoles.join(', ')}] role privileges. Your role is '${req.user.role}'.`
      });
    }

    next();
  };
};

