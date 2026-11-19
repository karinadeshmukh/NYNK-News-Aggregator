import React from 'react';
import { Cluster } from '../services/api';
import { PerspectiveSpectrumBar } from './PerspectiveSpectrumBar';
import { getClusterEditorialImage } from '../services/imageService';
import { ChevronRight, ShieldAlert } from 'lucide-react';

interface HagueSpotlightRowProps {
  sectionTitle: string;
  featuredStory: Cluster;
  subStories: Cluster[];
  onOpenStory: (cluster: Cluster) => void;
  onViewAll?: () => void;
}

export const HagueSpotlightRow: React.FC<HagueSpotlightRowProps> = ({
  sectionTitle,
  featuredStory,
  subStories,
  onOpenStory,
  onViewAll
}) => {
  if (!featuredStory) return null;

  const featuredImg = getClusterEditorialImage(featuredStory, 5);
  const totalOutlets = featuredStory.article_ids?.length || 1;
  const dateStr = featuredStory.created_at
    ? new Date(featuredStory.created_at).toLocaleDateString(undefined, {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })
    : 'November 19, 2026';

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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT (6 cols): Big Featured Story */}
        <article
          onClick={() => onOpenStory(featuredStory)}
          className="lg:col-span-6 group cursor-pointer space-y-4"
        >
          <div className="w-full aspect-[16/10] overflow-hidden bg-gray-100">
            <img
              src={featuredImg}
              alt={featuredStory.title}
              className="w-full h-full object-cover editorial-img-zoom"
              loading="lazy"
            />
          </div>

          <div className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
            {featuredStory.topic || 'Politics & Governance'}
          </div>

          <h3 className="font-serif font-black text-2xl sm:text-3xl text-gray-950 group-hover:text-blue-800 transition tracking-tight leading-snug">
            {featuredStory.title}
          </h3>

          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-normal line-clamp-3">
            {featuredStory.consensus_summary ||
              'Divergent editorial analysis examining government announcements alongside civil society inquiries and wire dispatches.'}
          </p>

          <div className="flex items-center gap-3 pt-1">
            <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
              N
            </div>
            <div className="text-xs text-gray-500">
              <span className="font-semibold text-gray-800">NYNK Wire Verification</span>
              <span className="mx-1.5">•</span>
              <span>{dateStr}</span>
            </div>
          </div>

          <div className="pt-2 max-w-md">
            <PerspectiveSpectrumBar
              perspectives={featuredStory.perspectives || {}}
              totalOutlets={totalOutlets}
              size="md"
              showLabels={true}
            />
          </div>
        </article>

        {/* RIGHT (6 cols): 2x2 Grid of 4 Stories */}
        <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {subStories.slice(0, 4).map((cluster, idx) => {
            const img = getClusterEditorialImage(cluster, idx + 6);
            const subDate = cluster.created_at
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
                className="group cursor-pointer space-y-2 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="w-full aspect-[4/3] overflow-hidden bg-gray-100">
                    <img
                      src={img}
                      alt={cluster.title}
                      className="w-full h-full object-cover editorial-img-zoom"
                      loading="lazy"
                    />
                  </div>

                  <div className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                    {cluster.topic || 'Politics'}
                  </div>

                  <h4 className="font-sans font-bold text-xs text-gray-950 group-hover:text-blue-700 transition leading-snug line-clamp-2">
                    {cluster.title}
                  </h4>

                  <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">
                    {cluster.consensus_summary || 'Reporting synthesized across multiple editorial viewpoints.'}
                  </p>

                  <div className="text-[10px] text-gray-400">
                    {subDate}
                  </div>
                </div>

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
      </div>
    </section>
  );
};
