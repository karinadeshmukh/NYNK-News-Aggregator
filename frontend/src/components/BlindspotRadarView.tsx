import React, { useState } from 'react';
import { Blindspot, Cluster } from '../services/api';
import { PerspectiveSpectrumBar } from './PerspectiveSpectrumBar';
import { getClusterEditorialImage, onImageLoadError } from '../services/imageService';
import { ShieldAlert, Compass, EyeOff, ArrowRight, Layers } from 'lucide-react';

interface BlindspotRadarViewProps {
  blindspots: Blindspot[];
  clusters: Cluster[];
  onSelectCluster: (cluster: Cluster) => void;
}

export const BlindspotRadarView: React.FC<BlindspotRadarViewProps> = ({
  blindspots,
  clusters,
  onSelectCluster
}) => {
  const [filter, setFilter] = useState<'all' | 'left' | 'right'>('all');

  const filteredBlindspots = blindspots.filter((b) => {
    if (filter === 'left') {
      return b.missing_perspective?.toLowerCase() === 'left';
    }
    if (filter === 'right') {
      return b.missing_perspective?.toLowerCase() === 'right';
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Radar Explainer Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-card">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
            <Compass className="w-3.5 h-3.5 text-rose-400" />
            <span>Coverage Asymmetry Radar</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-black tracking-tight text-white">
            Media Coverage Blindspot Detector
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Algorithms analyze reporting volume across all major publishers. When one political or editorial flank disproportionately ignores a national story while others report it heavily, it is flagged as an active Blindspot.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="bg-slate-800 p-1 rounded-xl flex items-center gap-1 text-xs font-semibold shrink-0 border border-slate-700">
          <button
            onClick={() => setFilter('all')}
            className={`py-1.5 px-3 rounded-lg transition ${
              filter === 'all' ? 'bg-white text-slate-900 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            All Blindspots ({blindspots.length})
          </button>
          <button
            onClick={() => setFilter('left')}
            className={`py-1.5 px-3 rounded-lg transition ${
              filter === 'left' ? 'bg-perspective-left text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Left Blindspots
          </button>
          <button
            onClick={() => setFilter('right')}
            className={`py-1.5 px-3 rounded-lg transition ${
              filter === 'right' ? 'bg-perspective-right text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Right Blindspots
          </button>
        </div>
      </div>

      {/* Blindspot Cards Grid */}
      {filteredBlindspots.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200 text-slate-500 space-y-2">
          <EyeOff className="w-8 h-8 mx-auto text-slate-300" />
          <p className="text-sm font-semibold">No active blindspots in this filter.</p>
          <p className="text-xs">Coverage is currently balanced across reporting outlets for these stories.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredBlindspots.map((b, idx) => {
            const cluster = clusters.find((c) => c.cluster_id === b.cluster_id);
            const isLeftBlindspot = b.missing_perspective?.toLowerCase() === 'left';

            return (
              <div
                key={b.cluster_id || idx}
                className="bg-white rounded-xl border border-slate-200/90 shadow-card p-6 flex flex-col justify-between hover:shadow-card-hover transition"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                        isLeftBlindspot
                          ? 'bg-blue-50 text-blue-900 border border-blue-200'
                          : 'bg-red-50 text-red-900 border border-red-200'
                      }`}
                    >
                      Missing: {b.missing_perspective} Coverage
                    </span>
                    <span className="text-[11px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                      Severity: {b.severity}
                    </span>
                  </div>

                  {cluster && (
                    <div className="w-full aspect-[16/9] mb-3 rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={getClusterEditorialImage(cluster, idx)}
                        alt={cluster.title}
                        onError={(e) => onImageLoadError(e, cluster, idx)}
                        className="w-full h-full object-cover editorial-img-zoom"
                        loading="lazy"
                      />
                    </div>
                  )}

                  <h3 className="font-serif font-bold text-lg text-slate-900 mb-2 leading-snug">
                    {b.cluster_title || cluster?.title || `Story Cluster ${b.cluster_id}`}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    {b.message || 'Significant divergence detected: one side of the editorial spectrum has chosen not to allocate coverage to this developing story.'}
                  </p>

                  {cluster && (
                    <div className="mb-4">
                      <PerspectiveSpectrumBar
                        perspectives={cluster.perspectives || {}}
                        totalOutlets={cluster.article_ids?.length || 1}
                        size="sm"
                        showLabels={true}
                      />
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">
                    {cluster ? `${cluster.article_ids?.length || 1} Outlets Reporting` : 'Verified News Cluster'}
                  </span>

                  {cluster && (
                    <button
                      onClick={() => onSelectCluster(cluster)}
                      className="text-xs font-bold text-slate-900 hover:text-blue-700 flex items-center gap-1"
                    >
                      <span>Examine Coverage</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
