import React from 'react';
import { Cluster } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Layers, Bookmark, CheckCircle2, Eye, Sparkles, AlertTriangle } from 'lucide-react';

interface ClusterCardProps {
  cluster: Cluster;
  index?: number;
  onCompare: (cluster: Cluster) => void;
  onInspectBias: (cluster: Cluster) => void;
  onAskAI: (cluster: Cluster) => void;
  onRequireAuth?: () => void;
}

const PASTEL_THEMES = [
  {
    bg: 'bg-[#FDE2E4]',        // Blush Pink
    border: 'border-[#F4B0B7]',
    accent: 'bg-rose-900 text-rose-100',
    tagBg: 'bg-white/80 text-rose-900 border-rose-300'
  },
  {
    bg: 'bg-[#E0F2FE]',        // Soft Sky Blue
    border: 'border-[#BAE6FD]',
    accent: 'bg-sky-900 text-sky-100',
    tagBg: 'bg-white/80 text-sky-900 border-sky-300'
  },
  {
    bg: 'bg-[#DCFCE7]',        // Mint / Pistachio Green
    border: 'border-[#86EFAC]',
    accent: 'bg-emerald-900 text-emerald-100',
    tagBg: 'bg-white/80 text-emerald-900 border-emerald-300'
  },
  {
    bg: 'bg-[#E8DFF5]',        // Soft Lilac / Lavender
    border: 'border-[#DDD6FE]',
    accent: 'bg-purple-900 text-purple-100',
    tagBg: 'bg-white/80 text-purple-900 border-purple-300'
  }
];

export const ClusterCard: React.FC<ClusterCardProps> = ({
  cluster,
  index = 0,
  onCompare,
  onInspectBias,
  onAskAI,
  onRequireAuth
}) => {
  const { isAuthenticated, isBookmarked, toggleBookmark } = useAuth();
  const theme = PASTEL_THEMES[index % PASTEL_THEMES.length];
  const bookmarked = isBookmarked(cluster.cluster_id);

  const p = cluster.perspectives || {
    left_count: 0,
    center_count: 0,
    right_count: 0,
    official_count: 0,
    dominant_perspective: 'Balanced'
  };

  const total = p.left_count + p.center_count + p.right_count + p.official_count || 1;
  const officialPct = Math.round((p.official_count / total) * 100);
  const leftPct = Math.round((p.left_count / total) * 100);
  const centerPct = Math.round((p.center_count / total) * 100);
  const rightPct = Math.round((p.right_count / total) * 100);

  const diversityScore = Math.round((cluster.diversity_score || 0.5) * 100);

  const handleBookmarkClick = () => {
    if (!isAuthenticated) {
      if (onRequireAuth) onRequireAuth();
      return;
    }
    toggleBookmark(cluster.cluster_id);
  };

  return (
    <article
      className={`rounded-3xl ${theme.bg} border-2 border-slate-900/15 p-6 sm:p-7 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:shadow-retro relative`}
    >
      <div>
        {/* Top Badges / Sticker + Bookmark Button */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase border ${theme.tagBg} shadow-sm`}>
              {cluster.topic || 'General'}
            </span>
            <span className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" />
              {cluster.article_ids?.length || 1} Outlets
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Diversity Score Badge */}
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-white/90 border border-slate-900/10 text-slate-800 shadow-sm">
              {diversityScore}% Diversity
            </span>

            {/* Bookmark button */}
            <button
              onClick={handleBookmarkClick}
              className={`p-1.5 rounded-full border transition ${
                bookmarked
                  ? 'bg-rose-500 border-rose-600 text-white shadow-sm'
                  : 'bg-white/90 border-slate-900/10 text-slate-600 hover:text-slate-950 hover:bg-white'
              }`}
              title={bookmarked ? 'Remove from Saved Stories' : 'Save Story'}
            >
              <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-white' : ''}`} />
            </button>
          </div>
        </div>

        {/* Headline in bold editorial style */}
        <h3 className="font-serif font-black text-xl sm:text-2xl text-slate-900 leading-tight mb-3">
          {cluster.title}
        </h3>

        {/* Consensus Summary */}
        <p className="text-xs sm:text-sm text-slate-800 leading-relaxed mb-4 font-normal">
          {cluster.consensus_summary || 'Consensus summary synthesized from multi-angle coverage.'}
        </p>

        {/* Key Verified Facts */}
        {cluster.key_facts && cluster.key_facts.length > 0 && (
          <div className="space-y-1.5 mb-5 p-3.5 rounded-2xl bg-white/70 border border-slate-900/10 shadow-sm">
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 mb-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-slate-900" />
              Agreed Key Facts
            </div>
            {cluster.key_facts.slice(0, 3).map((fact, idx) => (
              <div key={idx} className="flex items-start gap-1.5 text-xs text-slate-700 leading-snug">
                <span className="font-bold text-slate-900">•</span>
                <span>{fact}</span>
              </div>
            ))}
          </div>
        )}

        {/* Perspective Balance Breakdown */}
        <div className="mb-5">
          <div className="flex justify-between items-center text-xs mb-1.5 font-bold text-slate-800">
            <span>Coverage Balance:</span>
            <span className="text-[11px] font-medium text-slate-700">{p.dominant_perspective}</span>
          </div>

          {/* Visual Bar */}
          <div className="h-2.5 w-full rounded-full bg-white border border-slate-900/15 flex overflow-hidden p-0.5">
            {officialPct > 0 && (
              <div style={{ width: `${officialPct}%` }} className="bg-purple-500 h-full rounded-l-full" title={`Official: ${officialPct}%`} />
            )}
            {leftPct > 0 && (
              <div style={{ width: `${leftPct}%` }} className="bg-rose-400 h-full" title={`Left: ${leftPct}%`} />
            )}
            {centerPct > 0 && (
              <div style={{ width: `${centerPct}%` }} className="bg-sky-400 h-full" title={`Center: ${centerPct}%`} />
            )}
            {rightPct > 0 && (
              <div style={{ width: `${rightPct}%` }} className="bg-emerald-400 h-full rounded-r-full" title={`Right: ${rightPct}%`} />
            )}
          </div>

          <div className="flex justify-between text-[10px] font-semibold text-slate-600 mt-1.5">
            <span>🟣 PIB {officialPct}%</span>
            <span>🌸 Left {leftPct}%</span>
            <span>💧 Center {centerPct}%</span>
            <span>🌿 Right {rightPct}%</span>
          </div>
        </div>

        {/* Blindspot Tag if any */}
        {cluster.blindspot_detected && (
          <div className="p-3 rounded-2xl bg-white/90 border border-amber-300 flex items-start gap-2 text-xs text-amber-900 mb-5 shadow-sm">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span className="font-medium leading-tight">{cluster.blindspot_detected}</span>
          </div>
        )}
      </div>

      {/* Pill Action Buttons */}
      <div className="pt-4 border-t border-slate-900/10 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onCompare(cluster)}
            className="flex-1 py-2 px-3 rounded-full text-xs font-bold text-slate-900 bg-white border border-slate-900 hover:bg-slate-50 transition shadow-retro-sm text-center flex items-center justify-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Compare Outlets</span>
          </button>

          <button
            onClick={() => onInspectBias(cluster)}
            className="py-2 px-3.5 rounded-full text-xs font-bold text-slate-800 bg-white/80 border border-slate-900/20 hover:bg-white hover:border-slate-900 transition text-center flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Eye className="w-3.5 h-3.5 text-slate-700" />
            <span>Bias Factors</span>
          </button>
        </div>

        <button
          onClick={() => onAskAI(cluster)}
          className="w-full py-2 px-3 rounded-full text-xs font-bold text-slate-900 bg-white/60 hover:bg-white border border-slate-900/10 hover:border-slate-900 transition flex items-center justify-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5 text-rose-500" />
          <span>Ask AI About This Story →</span>
        </button>
      </div>
    </article>
  );
};
