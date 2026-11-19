import React from 'react';
import { Cluster } from '../services/api';
import { PerspectiveSpectrumBar } from './PerspectiveSpectrumBar';
import { getClusterEditorialImage } from '../services/imageService';
import { ChevronRight } from 'lucide-react';

interface HagueTopicRowProps {
  sectionTitle: string;
  categoryTag?: string;
  clusters: Cluster[];
  onOpenStory: (cluster: Cluster) => void;
  onViewAll?: () => void;
}

export const HagueTopicRow: React.FC<HagueTopicRowProps> = ({
  sectionTitle,
  categoryTag,
  clusters,
  onOpenStory,
  onViewAll
}) => {
  if (!clusters || clusters.length === 0) return null;

  return (
    <section className="py-10 border-b border-gray-200">
      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-gray-900 pb-2 mb-6">
        <h2 className="font-bold text-xs uppercase tracking-wider text-gray-900">
          {sectionTitle}
        </h2>

        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition flex items-center gap-0.5"
          >
            <span>View all</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* 4-Column Card Grid matching Hague Reference */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {clusters.slice(0, 4).map((cluster, idx) => {
          const img = getClusterEditorialImage(cluster, idx + 2);
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
              className="group cursor-pointer space-y-2.5 flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                {/* Photo */}
                <div className="w-full aspect-[4/3] overflow-hidden bg-gray-100">
                  <img
                    src={img}
                    alt={cluster.title}
                    className="w-full h-full object-cover editorial-img-zoom"
                    loading="lazy"
                  />
                </div>

                {/* Category Tag */}
                <div className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                  {categoryTag || cluster.topic || 'General'}
                </div>

                {/* Headline */}
                <h3 className="font-sans font-bold text-sm text-gray-950 group-hover:text-blue-700 transition leading-snug line-clamp-2">
                  {cluster.title}
                </h3>

                {/* Date */}
                <div className="text-[11px] text-gray-400">
                  {dateStr}
                </div>

                {/* Excerpt */}
                <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                  {cluster.consensus_summary ||
                    'Synthesizing reporting across official announcements, independent investigative reporting, and wire dispatches.'}
                </p>
              </div>

              {/* Bias Spectrum Bar */}
              <div className="pt-2">
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
    </section>
  );
};
