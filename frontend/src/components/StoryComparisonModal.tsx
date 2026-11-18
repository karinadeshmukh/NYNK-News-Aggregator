import React, { useEffect, useState } from 'react';
import { Cluster, Article, fetchClusterDetails } from '../services/api';
import { PerspectiveBadge } from './PerspectiveBadge';
import { X, ExternalLink, Columns, CheckCircle2, SplitSquareVertical } from 'lucide-react';

interface StoryComparisonModalProps {
  cluster: Cluster | null;
  onClose: () => void;
}

export const StoryComparisonModal: React.FC<StoryComparisonModalProps> = ({
  cluster,
  onClose
}) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!cluster) return;

    let isMounted = true;
    setIsLoading(true);

    fetchClusterDetails(cluster.cluster_id)
      .then((data) => {
        if (isMounted) {
          setArticles(data.articles || []);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [cluster]);

  if (!cluster) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-6xl max-h-[92vh] bg-cream-50 border-2 border-slate-900 rounded-3xl shadow-retro-lg flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-900/10 flex items-start justify-between bg-white">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-[#E8DFF5] text-purple-950 border border-purple-200">
                Multi-Publisher Side-by-Side View
              </span>
              <span className="text-xs font-semibold text-slate-500">• {articles.length} Reporting Outlets</span>
            </div>
            <h2 className="font-serif font-black text-xl sm:text-2xl text-slate-900">
              {cluster.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full border border-slate-300 hover:border-slate-900 text-slate-700 hover:text-slate-950 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Consensus vs Divergence Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-[#DCFCE7] border border-emerald-300 shadow-sm">
              <div className="text-xs font-extrabold uppercase tracking-wider text-emerald-950 mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-800" />
                Agreed Core Facts (Consensus Across All Media)
              </div>
              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                {cluster.consensus_summary}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#FDE2E4] border border-rose-300 shadow-sm">
              <div className="text-xs font-extrabold uppercase tracking-wider text-rose-950 mb-2 flex items-center gap-1.5">
                <SplitSquareVertical className="w-4 h-4 text-rose-800" />
                Editorial Framing Divergence
              </div>
              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                {cluster.coverage_divergence || 'Divergent perspectives reflect differing editorial priorities across political and economic angles.'}
              </p>
            </div>
          </div>

          {/* Perspective Angle Matrix */}
          {cluster.perspective_breakdown && cluster.perspective_breakdown.length > 0 && (
            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-3">
                Editorial Angle by Perspective
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {cluster.perspective_breakdown.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-white border border-slate-900/15 shadow-retro-sm flex flex-col justify-between">
                    <div>
                      <div className="mb-2">
                        <PerspectiveBadge perspective={item.perspective} />
                      </div>
                      <p className="text-xs text-slate-800 leading-relaxed font-medium mb-3">
                        {item.angle}
                      </p>
                    </div>
                    <div className="text-[11px] text-slate-500 font-semibold pt-2 border-t border-slate-100">
                      Sources: {item.articles_quoted.join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Individual Articles Columns */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-3">
              Side-by-Side Coverage ({articles.length} Publishers)
            </h4>

            {isLoading ? (
              <div className="py-12 text-center text-slate-500 text-sm">
                Loading side-by-side publisher reports...
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {articles.map((art) => (
                  <div
                    key={art.id}
                    className="p-5 rounded-2xl bg-white border-2 border-slate-900/15 shadow-retro-sm flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-2.5">
                        <span className="font-bold text-xs text-slate-900 truncate">
                          {art.source_name}
                        </span>
                        <PerspectiveBadge perspective={art.perspective} />
                      </div>

                      <h5 className="font-serif font-bold text-sm text-slate-900 mb-2 leading-snug">
                        {art.title}
                      </h5>

                      <p className="text-xs text-slate-600 leading-relaxed mb-4 line-clamp-5">
                        {art.content || art.summary}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">
                        {art.sentiment ? `Sentiment: ${art.sentiment}` : 'Analyzed'}
                      </span>
                      {art.url && (
                        <a
                          href={art.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 font-bold text-slate-900 hover:text-rose-600 underline"
                        >
                          Source <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-900/10 bg-white flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-full text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition shadow-retro-sm"
          >
            Close View
          </button>
        </div>
      </div>
    </div>
  );
};
