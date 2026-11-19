import React, { useState } from 'react';
import { Cluster } from '../services/api';
import { PerspectiveSpectrumBar } from './PerspectiveSpectrumBar';
import { useAuth } from '../context/AuthContext';
import {
  Layers,
  Bookmark,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Scale,
  Eye,
  Info
} from 'lucide-react';

interface ClusterCardProps {
  cluster: Cluster;
  index?: number;
  onOpenDeepDive: (cluster: Cluster) => void;
  onAskAI: (cluster: Cluster) => void;
  onRequireAuth?: () => void;
}

type TabType = 'overview' | 'official' | 'left' | 'center' | 'right';

export const ClusterCard: React.FC<ClusterCardProps> = ({
  cluster,
  onOpenDeepDive,
  onAskAI,
  onRequireAuth
}) => {
  const { isAuthenticated, isBookmarked, toggleBookmark } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const bookmarked = isBookmarked(cluster.cluster_id);
  const totalOutlets = cluster.article_ids?.length || 1;
  const diversityPct = Math.round((cluster.diversity_score || 0.5) * 100);

  // Find perspective entries
  const breakdown = cluster.perspective_breakdown || [];
  const officialData = breakdown.find((b) => b.perspective.toLowerCase().includes('official') || b.perspective.toLowerCase().includes('pib'));
  const leftData = breakdown.find((b) => b.perspective.toLowerCase().includes('left') || b.perspective.toLowerCase().includes('progressive'));
  const centerData = breakdown.find((b) => b.perspective.toLowerCase().includes('center') || b.perspective.toLowerCase().includes('wire'));
  const rightData = breakdown.find((b) => b.perspective.toLowerCase().includes('right') || b.perspective.toLowerCase().includes('conservative'));

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      if (onRequireAuth) onRequireAuth();
      return;
    }
    toggleBookmark(cluster.cluster_id);
  };

  return (
    <article className="bg-white rounded-xl border border-slate-200/90 shadow-card hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between overflow-hidden group">
      <div>
        {/* Top Metadata Header */}
        <div className="p-5 pb-3 border-b border-slate-100 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
              {cluster.topic || 'General'}
            </span>
            <span className="text-[12px] font-medium text-slate-500 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              {totalOutlets} Outlets
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              {diversityPct}% Diversity
            </span>
            <button
              onClick={handleBookmarkClick}
              title={bookmarked ? 'Remove Bookmark' : 'Save Story'}
              className={`p-1.5 rounded-md transition ${
                bookmarked
                  ? 'text-amber-600 bg-amber-50 hover:bg-amber-100'
                  : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Main Title & Ground News Spectrum */}
        <div className="p-5 pb-3">
          <h2
            onClick={() => onOpenDeepDive(cluster)}
            className="font-serif font-bold text-lg sm:text-xl text-slate-900 group-hover:text-blue-900 cursor-pointer transition-colors leading-snug line-clamp-3 mb-3"
          >
            {cluster.title}
          </h2>

          {/* Bias Distribution Bar */}
          <div className="mb-4">
            <PerspectiveSpectrumBar
              perspectives={cluster.perspectives || {}}
              totalOutlets={totalOutlets}
              size="sm"
              showLabels={true}
            />
          </div>

          {/* Inline Perspective Tabs (Direct Zero-Friction Comparison) */}
          <div className="border border-slate-200 rounded-lg p-1 bg-slate-50 flex items-center gap-1 text-[11px] font-semibold mb-3">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 py-1 rounded transition text-center ${
                activeTab === 'overview'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Consensus
            </button>

            {officialData && (
              <button
                onClick={() => setActiveTab('official')}
                className={`px-2 py-1 rounded transition flex items-center justify-center gap-1 ${
                  activeTab === 'official'
                    ? 'bg-perspective-official text-white shadow-sm font-bold'
                    : 'text-slate-500 hover:text-perspective-official'
                }`}
                title="Official PIB Record"
              >
                <span>PIB</span>
              </button>
            )}

            {leftData && (
              <button
                onClick={() => setActiveTab('left')}
                className={`px-2 py-1 rounded transition flex items-center justify-center gap-1 ${
                  activeTab === 'left'
                    ? 'bg-perspective-left text-white shadow-sm font-bold'
                    : 'text-slate-500 hover:text-perspective-left'
                }`}
                title="Left / Progressive Coverage"
              >
                <span>Left</span>
              </button>
            )}

            {centerData && (
              <button
                onClick={() => setActiveTab('center')}
                className={`px-2 py-1 rounded transition flex items-center justify-center gap-1 ${
                  activeTab === 'center'
                    ? 'bg-perspective-center text-white shadow-sm font-bold'
                    : 'text-slate-500 hover:text-perspective-center'
                }`}
                title="Center / Wire Coverage"
              >
                <span>Center</span>
              </button>
            )}

            {rightData && (
              <button
                onClick={() => setActiveTab('right')}
                className={`px-2 py-1 rounded transition flex items-center justify-center gap-1 ${
                  activeTab === 'right'
                    ? 'bg-perspective-right text-white shadow-sm font-bold'
                    : 'text-slate-500 hover:text-perspective-right'
                }`}
                title="Right / Conservative Coverage"
              >
                <span>Right</span>
              </button>
            )}
          </div>

          {/* Active Tab Content Panel */}
          <div className="min-h-[90px] text-xs text-slate-600 leading-relaxed bg-slate-50/60 p-3 rounded-lg border border-slate-200/60">
            {activeTab === 'overview' && (
              <div className="space-y-2">
                <p className="line-clamp-3">
                  {cluster.consensus_summary || 'Multi-perspective aggregation actively tracking reporting angles across official, wire, and regional publications.'}
                </p>
                {cluster.key_facts && cluster.key_facts[0] && (
                  <div className="text-[11px] font-medium text-slate-700 flex items-center gap-1 pt-1 border-t border-slate-200/50">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="line-clamp-1">{cluster.key_facts[0]}</span>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'official' && officialData && (
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold text-perspective-official uppercase tracking-wide">
                  Official Record (PIB Angle)
                </div>
                <p className="line-clamp-3 text-slate-700">{officialData.angle}</p>
                <div className="text-[10px] text-slate-500 font-medium pt-1">
                  Quoted: {officialData.articles_quoted?.join(', ') || 'PIB Press Releases'}
                </div>
              </div>
            )}

            {activeTab === 'left' && leftData && (
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold text-perspective-left uppercase tracking-wide">
                  Left / Progressive Framing
                </div>
                <p className="line-clamp-3 text-slate-700">{leftData.angle}</p>
                <div className="text-[10px] text-slate-500 font-medium pt-1">
                  Quoted: {leftData.articles_quoted?.join(', ') || 'Independent Outlets'}
                </div>
              </div>
            )}

            {activeTab === 'center' && centerData && (
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">
                  Center / Wire Dispatch
                </div>
                <p className="line-clamp-3 text-slate-700">{centerData.angle}</p>
                <div className="text-[10px] text-slate-500 font-medium pt-1">
                  Quoted: {centerData.articles_quoted?.join(', ') || 'Reuters, PTI, Wire'}
                </div>
              </div>
            )}

            {activeTab === 'right' && rightData && (
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold text-perspective-right uppercase tracking-wide">
                  Right / Conservative Framing
                </div>
                <p className="line-clamp-3 text-slate-700">{rightData.angle}</p>
                <div className="text-[10px] text-slate-500 font-medium pt-1">
                  Quoted: {rightData.articles_quoted?.join(', ') || 'National Outlets'}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="p-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 bg-slate-50/50">
        <button
          onClick={() => onAskAI(cluster)}
          className="text-xs font-semibold text-slate-600 hover:text-indigo-600 flex items-center gap-1.5 py-1 px-2.5 rounded-md hover:bg-indigo-50/60 transition"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span>Ask AI</span>
        </button>

        <button
          onClick={() => onOpenDeepDive(cluster)}
          className="text-xs font-bold text-slate-900 hover:text-blue-700 flex items-center gap-1 py-1 px-3 rounded-md hover:bg-slate-100 transition"
        >
          <span>Deep Dive</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </article>
  );
};
