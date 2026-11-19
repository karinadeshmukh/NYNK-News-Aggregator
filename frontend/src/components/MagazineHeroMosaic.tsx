import React from 'react';
import { Cluster } from '../services/api';
import { PerspectiveSpectrumBar } from './PerspectiveSpectrumBar';
import { getClusterEditorialImage } from '../services/imageService';
import { Layers, CheckCircle2, ArrowRight } from 'lucide-react';

interface MagazineHeroMosaicProps {
  leadStory: Cluster;
  secondaryStory1: Cluster;
  secondaryStory2: Cluster;
  onOpenStory: (cluster: Cluster) => void;
}

export const MagazineHeroMosaic: React.FC<MagazineHeroMosaicProps> = ({
  leadStory,
  secondaryStory1,
  secondaryStory2,
  onOpenStory
}) => {
  if (!leadStory) return null;

  const leadImg = getClusterEditorialImage(leadStory, 0);
  const secImg1 = secondaryStory1 ? getClusterEditorialImage(secondaryStory1, 1) : '';
  const secImg2 = secondaryStory2 ? getClusterEditorialImage(secondaryStory2, 2) : '';

  const totalOutlets = leadStory.article_ids?.length || 1;

  return (
    <div className="w-full mb-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4">
        {/* LEFT: USA TODAY STYLE GIANT FEATURE CARD (8 cols) */}
        <div
          onClick={() => onOpenStory(leadStory)}
          className="lg:col-span-8 relative rounded-xl sm:rounded-2xl overflow-hidden cursor-pointer group min-h-[460px] sm:min-h-[520px] flex flex-col justify-end p-5 sm:p-8 bg-slate-900 shadow-lg"
        >
          {/* Full-bleed Background Image with Hover Zoom */}
          <img
            src={leadImg}
            alt={leadStory.title}
            className="absolute inset-0 w-full h-full object-cover editorial-img-zoom opacity-80 group-hover:opacity-90 transition-opacity"
            loading="eager"
          />

          {/* Dark Gradient Overlay for Maximum Text Contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

          {/* Top Badges */}
          <div className="absolute top-5 left-5 right-5 flex items-center justify-between gap-2 z-10">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded text-[11px] font-black uppercase tracking-wider bg-red-600 text-white flex items-center gap-1.5 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                Live Story
              </span>
              <span className="px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wider bg-[#0091FF] text-white shadow-sm">
                {leadStory.topic || 'National'}
              </span>
            </div>

            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-black/60 backdrop-blur-md text-white border border-white/20 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>{totalOutlets} Outlets Verified</span>
            </span>
          </div>

          {/* Bottom Content Area */}
          <div className="relative z-10 space-y-3.5 text-white">
            <h1 className="font-serif font-black text-2xl sm:text-4xl lg:text-5xl tracking-tight leading-[1.15] text-white group-hover:text-cyan-200 transition-colors drop-shadow-sm">
              {leadStory.title}
            </h1>

            <p className="text-xs sm:text-sm text-gray-200 font-normal leading-relaxed line-clamp-2 max-w-2xl">
              {leadStory.consensus_summary ||
                'Transparent multi-perspective synthesis examining government statements, regional impacts, and wire coverage.'}
            </p>

            {/* USA Today Style Bullet Quotes / Developments underneath */}
            {leadStory.key_facts && leadStory.key_facts.length > 0 && (
              <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-white/20">
                {leadStory.key_facts.slice(0, 3).map((fact, idx) => (
                  <div key={idx} className="text-[11px] text-gray-300 line-clamp-2 leading-snug">
                    <span className="text-cyan-400 font-bold mr-1">•</span>
                    <span>"{fact}"</span>
                  </div>
                ))}
              </div>
            )}

            {/* Embedded Ground News Spectrum Bar */}
            <div className="pt-3 max-w-lg bg-black/40 backdrop-blur-md p-3 rounded-xl border border-white/10">
              <PerspectiveSpectrumBar
                perspectives={leadStory.perspectives || {}}
                totalOutlets={totalOutlets}
                size="md"
                showLabels={true}
              />
            </div>
          </div>
        </div>

        {/* RIGHT: 2 STACKED TILES (4 cols) matching USA Today / Jannah */}
        <div className="lg:col-span-4 flex flex-col gap-3 sm:gap-4">
          {/* Tile 1 */}
          {secondaryStory1 && (
            <div
              onClick={() => onOpenStory(secondaryStory1)}
              className="relative flex-1 rounded-xl sm:rounded-2xl overflow-hidden cursor-pointer group min-h-[220px] sm:min-h-[250px] flex flex-col justify-end p-5 bg-slate-900 shadow-md"
            >
              <img
                src={secImg1}
                alt={secondaryStory1.title}
                className="absolute inset-0 w-full h-full object-cover editorial-img-zoom opacity-80 group-hover:opacity-90 transition-opacity"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

              <div className="absolute top-4 left-4 z-10">
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-rose-600 text-white">
                  {secondaryStory1.topic || 'National'}
                </span>
              </div>

              <div className="relative z-10 space-y-2 text-white">
                <h2 className="font-serif font-black text-lg sm:text-xl text-white group-hover:text-cyan-200 transition-colors leading-tight line-clamp-3">
                  {secondaryStory1.title}
                </h2>
                <div className="pt-1">
                  <PerspectiveSpectrumBar
                    perspectives={secondaryStory1.perspectives || {}}
                    totalOutlets={secondaryStory1.article_ids?.length || 1}
                    size="sm"
                    showLabels={false}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tile 2 */}
          {secondaryStory2 && (
            <div
              onClick={() => onOpenStory(secondaryStory2)}
              className="relative flex-1 rounded-xl sm:rounded-2xl overflow-hidden cursor-pointer group min-h-[220px] sm:min-h-[250px] flex flex-col justify-end p-5 bg-slate-900 shadow-md"
            >
              <img
                src={secImg2}
                alt={secondaryStory2.title}
                className="absolute inset-0 w-full h-full object-cover editorial-img-zoom opacity-80 group-hover:opacity-90 transition-opacity"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

              <div className="absolute top-4 left-4 z-10">
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white">
                  {secondaryStory2.topic || 'Economy'}
                </span>
              </div>

              <div className="relative z-10 space-y-2 text-white">
                <h2 className="font-serif font-black text-lg sm:text-xl text-white group-hover:text-cyan-200 transition-colors leading-tight line-clamp-3">
                  {secondaryStory2.title}
                </h2>
                <div className="pt-1">
                  <PerspectiveSpectrumBar
                    perspectives={secondaryStory2.perspectives || {}}
                    totalOutlets={secondaryStory2.article_ids?.length || 1}
                    size="sm"
                    showLabels={false}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
