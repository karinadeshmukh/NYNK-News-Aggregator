import { Request, Response } from 'express';
import { aiClient } from '../services/aiClient';
import { store } from '../services/store';

export const analyzeCustomText = async (req: Request, res: Response) => {
  try {
    const { title, content, source_name } = req.body;
    if (!title) {
      return res.status(400).json({ success: false, error: 'Title is required for bias analysis.' });
    }

    const analysis = await aiClient.analyzeBias(title, content || '', source_name || '');
    res.json({
      success: true,
      analysis
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getBlindspots = async (req: Request, res: Response) => {
  try {
    const blindspots = await store.getBlindspots(30);
    res.json({
      success: true,
      count: blindspots.length,
      blindspots
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

