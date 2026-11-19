import React from 'react';
import { Cluster } from '../services/api';
import { getClusterEditorialImage, onImageLoadError } from '../services/imageService';
import { Clock, TrendingUp } from 'lucide-react';

interface TopStoriesLeaderboardProps {
  topStories: Cluster[];
  recentStories: Cluster[];
  onOpenStory: (cluster: Cluster) => void;
}

const formatTimeAgo = (dateStr?: string) => {
  if (!dateStr) return 'Just now';
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  if (isNaN(diff) || diff < 1) return 'Just now';
  if (diff < 60) return `${diff}m ago`;
  const hrs = Math.floor(diff / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

export const TopStoriesLeaderboard: React.FC<TopStoriesLeaderboardProps> = ({
  topStories,
  recentStories,
  onOpenStory
}) => {
  return (
    <div className="space-y-8">
      {/* USA TODAY STYLE NUMBERED 1-5 TOP STORIES */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-gray-900 pb-2">
          <h3 className="font-sans font-black text-sm uppercase tracking-wider text-black flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-[#0091FF]" />
            <span>Top Verified Stories</span>
          </h3>
          <span className="text-[10px] text-gray-400 font-bold uppercase">Ranked</span>
        </div>

        <div className="divide-y divide-gray-100 space-y-3">
          {topStories.slice(0, 5).map((cluster, idx) => {
            const thumb = getClusterEditorialImage(cluster, idx + 3);
            const rank = idx + 1;

            return (
              <div
                key={cluster.cluster_id || idx}
                onClick={() => onOpenStory(cluster)}
                className="pt-3 first:pt-0 group cursor-pointer flex items-center justify-between gap-3 relative"
              >
                <div className="flex items-start gap-3 flex-1">
                  {/* Big Number Watermark (USA Today Style) */}
                  <span className="font-serif font-black text-2xl text-gray-300 group-hover:text-[#0091FF] transition-colors leading-none w-5 shrink-0">
                    {rank}
                  </span>

                  <div className="space-y-1">
                    <h4 className="font-sans font-bold text-xs text-gray-900 group-hover:text-[#0091FF] transition leading-snug line-clamp-2">
                      {cluster.title}
                    </h4>
                    <div className="text-[10px] text-gray-400 font-medium">
                      {cluster.topic || 'National'} • {cluster.article_ids?.length || 1} Outlets
                    </div>
                  </div>
                </div>

                <div className="w-14 h-14 rounded-lg shrink-0 bg-gray-100 overflow-hidden">
                  <img
                    src={thumb}
                    alt={cluster.title}
                    onError={(e) => onImageLoadError(e, cluster, idx + 3)}
                    className="w-full h-full object-cover editorial-img-zoom"
                    loading="lazy"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* "RIGHT NOW" LIVE WIRE FEED LIST */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-gray-900 pb-2">
          <h3 className="font-sans font-black text-sm uppercase tracking-wider text-black flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-emerald-600" />
            <span>Right Now</span>
          </h3>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>

        <div className="divide-y divide-gray-100 space-y-3">
          {recentStories.slice(0, 5).map((cluster, idx) => (
            <div
              key={cluster.cluster_id || idx}
              onClick={() => onOpenStory(cluster)}
              className="pt-3 first:pt-0 group cursor-pointer space-y-1"
            >
              <h4 className="font-sans font-bold text-xs text-gray-900 group-hover:text-[#0091FF] transition leading-snug line-clamp-2">
                {cluster.title}
              </h4>
              <div className="text-[10px] text-gray-400 flex items-center gap-1">
                <span className="font-semibold text-gray-700">{cluster.topic || 'Wire'}</span>
                <span>•</span>
                <span>{formatTimeAgo(cluster.updated_at || cluster.created_at)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
