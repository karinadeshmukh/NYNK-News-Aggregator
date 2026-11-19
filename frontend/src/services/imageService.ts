import React from 'react';
import { Cluster } from './api';

const TOPIC_IMAGES: Record<string, string[]> = {
  semiconductor: [
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80'
  ],
  renewable: [
    'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&w=800&q=80'
  ],
  shipbuilding: [
    'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=800&q=80'
  ],
  reform: [
    'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&w=800&q=80'
  ],
  economy: [
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=800&q=80'
  ],
  politics: [
    'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80'
  ],
  technology: [
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80'
  ],
  people: [
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=800&q=80'
  ]
};

const DEFAULT_EDITORIAL_IMAGES = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80'
];

export const getFallbackEditorialImage = (cluster?: Cluster | null, index: number = 0): string => {
  if (!cluster) {
    return DEFAULT_EDITORIAL_IMAGES[index % DEFAULT_EDITORIAL_IMAGES.length];
  }
  const text = `${cluster.title || ''} ${cluster.topic || ''} ${cluster.consensus_summary || ''}`.toLowerCase();

  if (text.includes('semi') || text.includes('chip') || text.includes('fab') || text.includes('hardware')) {
    return TOPIC_IMAGES.semiconductor[index % TOPIC_IMAGES.semiconductor.length];
  }
  if (text.includes('solar') || text.includes('renewable') || text.includes('energy') || text.includes('green') || text.includes('200 gw')) {
    return TOPIC_IMAGES.renewable[index % TOPIC_IMAGES.renewable.length];
  }
  if (text.includes('ship') || text.includes('maritime') || text.includes('naval') || text.includes('vessel') || text.includes('port')) {
    return TOPIC_IMAGES.shipbuilding[index % TOPIC_IMAGES.shipbuilding.length];
  }
  if (text.includes('voter') || text.includes('elect') || text.includes('bill') || text.includes('reform') || text.includes('law')) {
    return TOPIC_IMAGES.reform[index % TOPIC_IMAGES.reform.length];
  }
  if (text.includes('inflation') || text.includes('price') || text.includes('econom') || text.includes('market') || text.includes('rbi') || text.includes('bank')) {
    return TOPIC_IMAGES.economy[index % TOPIC_IMAGES.economy.length];
  }
  if (text.includes('modi') || text.includes('congress') || text.includes('parliament') || text.includes('minister') || text.includes('govern')) {
    return TOPIC_IMAGES.politics[index % TOPIC_IMAGES.politics.length];
  }

  return DEFAULT_EDITORIAL_IMAGES[index % DEFAULT_EDITORIAL_IMAGES.length];
};

export const getClusterEditorialImage = (cluster: Cluster, index: number = 0): string => {
  // 1. Direct Publisher Photo extracted from Media RSS feed
  if (cluster.image_url && typeof cluster.image_url === 'string' && cluster.image_url.trim().startsWith('http')) {
    return cluster.image_url;
  }

  // 2. Fallback to topic-matched authentic editorial photography
  return getFallbackEditorialImage(cluster, index);
};

export const onImageLoadError = (
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  cluster?: Cluster | null,
  index: number = 0
) => {
  const target = e.currentTarget;
  target.onerror = null; // stop any infinite error loop
  target.src = getFallbackEditorialImage(cluster, index);
};
