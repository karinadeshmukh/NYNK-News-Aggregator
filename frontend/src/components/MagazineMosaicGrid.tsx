import React from 'react';
import { Cluster } from '../services/api';
import { PerspectiveSpectrumBar } from './PerspectiveSpectrumBar';
import { getClusterEditorialImage } from '../services/imageService';
import { Layers } from 'lucide-react';

interface MagazineMosaicGridProps {
  sectionTitle: string;
  clusters: Cluster[];
  activeFilter: string;
  onSelectFilter: (filter: string) => void;
  onOpenStory: (cluster: Cluster) => void;
}

export const MagazineMosaicGrid: React.FC<MagazineMosaicGridProps> = ({
  sectionTitle,
  clusters,
  activeFilter,
  onSelectFilter,
  onOpenStory
}) => {
  const tabs = ['All Stories', 'High Divergence', 'Economy', 'Governance', 'Technology'];

  return (
    <div className="space-y-6">
      {/* Sub-bar: USA Today Style Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-900 pb-2 gap-3">
        <h2 className="font-sans font-black text-sm uppercase tracking-wider text-black">
          {sectionTitle}
        </h2>

        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none text-xs font-bold text-gray-500">
          {tabs.map((tab) => {
            const isSelected = activeFilter.toLowerCase() === tab.toLowerCase();
            return (
              <button
                key={tab}
                onClick={() => onSelectFilter(tab)}
                className={`py-1 px-2.5 rounded-full whitespace-nowrap transition ${
                  isSelected
                    ? 'bg-black text-white'
                    : 'hover:text-black hover:bg-gray-100'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      {/* USA TODAY / JANNAH STYLE MOSAIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {clusters.slice(0, 6).map((cluster, idx) => {
          const img = getClusterEditorialImage(cluster, idx + 4);
          const totalOutlets = cluster.article_ids?.length || 1;
          const isLeadCard = idx === 0 || idx === 3; // Alternate full-bleed photo cards

          if (isLeadCard) {
            // Full-bleed photo card with dark gradient (USA Today style)
            return (
              <article
                key={cluster.cluster_id || idx}
                onClick={() => onOpenStory(cluster)}
                className="relative rounded-xl overflow-hidden cursor-pointer group min-h-[300px] flex flex-col justify-end p-5 bg-slate-900 shadow-md"
              >
                <img
                  src={img}
                  alt={cluster.title}
                  className="absolute inset-0 w-full h-full object-cover editorial-img-zoom opacity-80 group-hover:opacity-90 transition-opacity"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

                <div className="absolute top-4 left-4 z-10">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-[#0091FF] text-white">
                    {cluster.topic || 'National'}
                  </span>
                </div>

                <div className="relative z-10 space-y-2 text-white">
                  <h3 className="font-serif font-black text-base sm:text-lg text-white group-hover:text-cyan-200 transition-colors leading-snug line-clamp-2">
                    {cluster.title}
                  </h3>
                  <div className="pt-1">
                    <PerspectiveSpectrumBar
                      perspectives={cluster.perspectives || {}}
                      totalOutlets={totalOutlets}
                      size="sm"
                      showLabels={false}
                    />
                  </div>
                </div>
              </article>
            );
          }

          // Clean editorial card with photo on top
          return (
            <article
              key={cluster.cluster_id || idx}
              onClick={() => onOpenStory(cluster)}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden cursor-pointer group hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="w-full aspect-[16/10] overflow-hidden bg-gray-100">
                  <img
                    src={img}
                    alt={cluster.title}
                    className="w-full h-full object-cover editorial-img-zoom"
                    loading="lazy"
                  />
                </div>

                <div className="p-4 space-y-2">
                  <span className="inline-block text-[10px] font-bold text-[#0091FF] uppercase tracking-wider">
                    {cluster.topic || 'National'}
                  </span>

                  <h3 className="font-sans font-bold text-sm text-gray-950 group-hover:text-[#0091FF] transition leading-snug line-clamp-2">
                    {cluster.title}
                  </h3>

                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                    {cluster.consensus_summary || 'Multi-perspective news report verified across wire publishers.'}
                  </p>
                </div>
              </div>

              <div className="px-4 pb-4 pt-1">
                <PerspectiveSpectrumBar
                  perspectives={cluster.perspectives || {}}
                  totalOutlets={totalOutlets}
                  size="sm"
                  showLabels={false}
                />
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};
