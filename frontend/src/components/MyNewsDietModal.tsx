import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Cluster } from '../services/api';
import { X, PieChart, ShieldCheck, AlertCircle, ArrowRight, Award } from 'lucide-react';

interface MyNewsDietModalProps {
  isOpen: boolean;
  onClose: () => void;
  clusters: Cluster[];
  onSelectCluster: (cluster: Cluster) => void;
}

export const MyNewsDietModal: React.FC<MyNewsDietModalProps> = ({
  isOpen,
  onClose,
  clusters,
  onSelectCluster
}) => {
  const { user, isAuthenticated } = useAuth();

  if (!isOpen) return null;

  // Compute stats based on bookmarks or general clusters
  const bookmarkedIds = user?.bookmarked_cluster_ids || [];
  const relevantClusters = clusters.filter((c) => bookmarkedIds.includes(c.cluster_id));
  const activeSet = relevantClusters.length > 0 ? relevantClusters : clusters.slice(0, 10);

  let totalOfficial = 0;
  let totalLeft = 0;
  let totalCenter = 0;
  let totalRight = 0;

  activeSet.forEach((c) => {
    totalOfficial += c.perspectives?.official_count || 0;
    totalLeft += c.perspectives?.left_count || 0;
    totalCenter += c.perspectives?.center_count || 0;
    totalRight += c.perspectives?.right_count || 0;
  });

  const sum = totalOfficial + totalLeft + totalCenter + totalRight || 1;
  const officialPct = Math.round((totalOfficial / sum) * 100);
  const leftPct = Math.round((totalLeft / sum) * 100);
  const centerPct = Math.round((totalCenter / sum) * 100);
  const rightPct = Math.round((totalRight / sum) * 100);

  // Balance calculation (standard deviation from 25%)
  const variance = (
    Math.pow(officialPct - 25, 2) +
    Math.pow(leftPct - 25, 2) +
    Math.pow(centerPct - 25, 2) +
    Math.pow(rightPct - 25, 2)
  ) / 4;
  const balanceScore = Math.max(10, Math.min(100, Math.round(100 - Math.sqrt(variance) * 1.5)));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white rounded-2xl border border-slate-200/90 shadow-2xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center">
              <PieChart className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-black text-xl text-slate-900">My News Diet</h3>
              <p className="text-xs text-slate-500">Personal media perspective balance tracker</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Balance Score Card */}
        <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Diet Balance Score
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-serif font-black text-slate-900">{balanceScore}</span>
              <span className="text-xs font-semibold text-slate-400">/ 100</span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              {balanceScore >= 80 ? 'Highly balanced exposure across the spectrum.' : 'Moderate perspective skew detected.'}
            </p>
          </div>

          <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <Award className="w-7 h-7" />
          </div>
        </div>

        {/* Perspective Breakdown Meter */}
        <div className="space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Current Media Consumption Ratio
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-perspective-official font-bold">🏛️ Official (PIB Record)</span>
                <span>{officialPct}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                <div style={{ width: `${officialPct}%` }} className="h-full bg-perspective-official rounded-full" />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-perspective-left font-bold">🟦 Left-Leaning Outlets</span>
                <span>{leftPct}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                <div style={{ width: `${leftPct}%` }} className="h-full bg-perspective-left rounded-full" />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-slate-700 font-bold">⬜ Center & Wire Services</span>
                <span>{centerPct}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                <div style={{ width: `${centerPct}%` }} className="h-full bg-perspective-center rounded-full" />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-perspective-right font-bold">🟥 Right-Leaning Outlets</span>
                <span>{rightPct}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                <div style={{ width: `${rightPct}%` }} className="h-full bg-perspective-right rounded-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Personalized Recommendation */}
        <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 space-y-1">
          <div className="font-bold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-blue-700" />
            <span>Curator Recommendation</span>
          </div>
          <p className="text-blue-800 leading-relaxed">
            {leftPct > 40
              ? 'Your consumption shows higher Left perspective volume. Check Right-flank and PIB official records in the Blindspot Radar to cross-verify.'
              : rightPct > 40
              ? 'Your consumption leans Right. Read Center wire and investigative Left reports on civic and regulatory impacts to balance your intake.'
              : 'Your reading is well-diversified. Keep checking high-divergence stories on today’s feed.'}
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition"
        >
          Close News Diet
        </button>
      </div>
    </div>
  );
};
