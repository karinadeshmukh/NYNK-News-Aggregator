import React from 'react';
import { Cluster } from '../services/api';
import { PerspectiveSpectrumBar } from './PerspectiveSpectrumBar';
import { getClusterEditorialImage } from '../services/imageService';

interface HagueTopBroadsheetProps {
  leadStory: Cluster;
  leftStories: Cluster[];
  latestStories: Cluster[];
  onOpenStory: (cluster: Cluster) => void;
}

export const HagueTopBroadsheet: React.FC<HagueTopBroadsheetProps> = ({
  leadStory,
  leftStories,
  latestStories,
  onOpenStory
}) => {
  if (!leadStory) return null;

  const leadImage = getClusterEditorialImage(leadStory, 0);
  const totalOutlets = leadStory.article_ids?.length || 1;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-12 border-b border-gray-200">
      {/* LEFT COLUMN (3 cols): 2 Stacked Feature Stories */}
      <div className="lg:col-span-3 space-y-8 lg:border-r lg:border-gray-200 lg:pr-8">
        {leftStories.slice(0, 2).map((cluster, idx) => {
          const img = getClusterEditorialImage(cluster, idx + 1);
          const dateStr = cluster.created_at
            ? new Date(cluster.created_at).toLocaleDateString(undefined, {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })
            : 'November 19, 2026';

          return (
            <article
              key={cluster.cluster_id || idx}
              onClick={() => onOpenStory(cluster)}
              className="group cursor-pointer space-y-3"
            >
              {/* Image */}
              <div className="w-full aspect-[4/3] overflow-hidden bg-gray-100">
                <img
                  src={img}
                  alt={cluster.title}
                  className="w-full h-full object-cover editorial-img-zoom"
                  loading="lazy"
                />
              </div>

              {/* Category */}
              <div className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                {cluster.topic || 'National'}
              </div>

              {/* Headline */}
              <h3 className="font-sans font-bold text-base text-gray-950 group-hover:text-blue-700 transition leading-snug line-clamp-2">
                {cluster.title}
              </h3>

              {/* Date */}
              <div className="text-xs text-gray-400 font-normal">
                {dateStr}
              </div>

              {/* Slim Bias Distribution Bar */}
              <div className="pt-1">
                <PerspectiveSpectrumBar
                  perspectives={cluster.perspectives || {}}
                  totalOutlets={cluster.article_ids?.length || 1}
                  size="sm"
                  showLabels={false}
                />
              </div>
            </article>
          );
        })}
      </div>

      {/* CENTER COLUMN (6 cols): Main Lead Editorial Feature */}
      <div className="lg:col-span-6 space-y-5 lg:border-r lg:border-gray-200 lg:pr-8 text-center">
        <article
          onClick={() => onOpenStory(leadStory)}
          className="group cursor-pointer space-y-4"
        >
          {/* Main Hero Photo */}
          <div className="w-full aspect-[16/11] overflow-hidden bg-gray-100">
            <img
              src={leadImage}
              alt={leadStory.title}
              className="w-full h-full object-cover editorial-img-zoom"
              loading="eager"
            />
          </div>

          {/* Centered Category Badge */}
          <div className="inline-block text-[11px] font-bold text-blue-600 uppercase tracking-wider">
            {leadStory.topic || 'National Intelligence'}
          </div>

          {/* Headline */}
          <h2 className="font-serif font-black text-2xl sm:text-4xl text-gray-950 group-hover:text-blue-800 transition tracking-tight leading-tight px-2">
            {leadStory.title}
          </h2>

          {/* Consensus Excerpt */}
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-normal max-w-xl mx-auto line-clamp-3">
            {leadStory.consensus_summary ||
              'Multi-perspective aggregation tracking verified developments across official government records, wire dispatches, and national commentary.'}
          </p>

          {/* Byline & Date */}
          <div className="text-xs text-gray-500 font-medium">
            <span>
              {leadStory.created_at
                ? new Date(leadStory.created_at).toLocaleDateString(undefined, {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })
                : 'November 19, 2026'}
            </span>
            <span className="mx-2 text-gray-300">•</span>
            <span className="text-gray-700 font-semibold">
              Covered by {totalOutlets} Reporting Outlets (PIB, Reuters, The Hindu, Swarajya)
            </span>
          </div>

          {/* Centered Ground News Bias Distribution Bar */}
          <div className="max-w-md mx-auto pt-2">
            <PerspectiveSpectrumBar
              perspectives={leadStory.perspectives || {}}
              totalOutlets={totalOutlets}
              size="md"
              showLabels={true}
            />
          </div>
        </article>
      </div>

      {/* RIGHT COLUMN (3 cols): "LATEST" Sidebar */}
      <div className="lg:col-span-3 space-y-4">
        <div className="border-b border-gray-900 pb-2">
          <h3 className="font-bold text-xs uppercase tracking-wider text-gray-900">
            Latest Wire & Reports
          </h3>
        </div>

        <div className="divide-y divide-gray-100 space-y-4">
          {latestStories.slice(0, 5).map((cluster, idx) => {
            const thumb = getClusterEditorialImage(cluster, idx + 4);
            const dateStr = cluster.created_at
              ? new Date(cluster.created_at).toLocaleDateString(undefined, {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })
              : 'November 19, 2026';

            return (
              <div
                key={cluster.cluster_id || idx}
                onClick={() => onOpenStory(cluster)}
                className="pt-4 first:pt-0 group cursor-pointer flex items-start justify-between gap-3"
              >
                <div className="flex-1 space-y-1">
                  <h4 className="font-sans font-bold text-xs text-gray-900 group-hover:text-blue-700 transition leading-snug line-clamp-2">
                    {cluster.title}
                  </h4>
                  <div className="text-[11px] text-gray-400">
                    {dateStr}
                  </div>
                </div>

                <div className="w-16 h-16 shrink-0 bg-gray-100 overflow-hidden">
                  <img
                    src={thumb}
                    alt={cluster.title}
                    className="w-full h-full object-cover editorial-img-zoom"
                    loading="lazy"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
