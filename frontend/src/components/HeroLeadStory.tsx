import React from 'react';
import { Cluster } from '../services/api';
import { PerspectiveSpectrumBar } from './PerspectiveSpectrumBar';
import { Sparkles, Layers, ArrowUpRight, Scale, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface HeroLeadStoryProps {
  cluster: Cluster;
  onOpenDeepDive: (cluster: Cluster) => void;
  onAskAI: (cluster: Cluster) => void;
}

export const HeroLeadStory: React.FC<HeroLeadStoryProps> = ({
  cluster,
  onOpenDeepDive,
  onAskAI
}) => {
  if (!cluster) return null;

  const totalOutlets = cluster.article_ids?.length || 1;
  const diversityPct = Math.round((cluster.diversity_score || 0.5) * 100);

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200/90 shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden mb-10">
      <div className="p-6 sm:p-8 lg:p-10">
        {/* Top Intelligence Metadata Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-rose-50 border border-rose-200 text-rose-700">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
              Lead Intelligence Story
            </span>
            <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
              {cluster.topic || 'General News'}
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
            <span className="flex items-center gap-1 text-slate-700 font-semibold">
              <Layers className="w-3.5 h-3.5 text-slate-500" />
              {totalOutlets} Outlets Reporting
            </span>
            <span className="flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              <Scale className="w-3.5 h-3.5" />
              {diversityPct}% Perspective Diversity
            </span>
          </div>
        </div>

        {/* Main Grid: Headline + Consensus on Left, Bias Distribution & Action on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 space-y-4">
            <h1
              onClick={() => onOpenDeepDive(cluster)}
              className="text-2xl sm:text-3xl lg:text-4xl font-serif font-black text-slate-900 tracking-tight leading-tight hover:text-blue-900 cursor-pointer transition-colors"
            >
              {cluster.title}
            </h1>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
              {cluster.consensus_summary || 'Multi-perspective aggregation actively analyzing divergent editorial narratives across verified wire and regional publishers.'}
            </p>

            {/* Key Verified Facts Pills */}
            {cluster.key_facts && cluster.key_facts.length > 0 && (
              <div className="pt-2">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Key Verified Developments
                </div>
                <div className="space-y-1.5">
                  {cluster.key_facts.slice(0, 3).map((fact, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0" />
                      <span>{fact}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Ground News Style Bias Distribution & CTA */}
          <div className="lg:col-span-5 bg-slate-50 rounded-xl p-6 border border-slate-200/80 space-y-5">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Media Coverage Distribution
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {cluster.perspectives?.dominant_perspective || 'Multi-Sourced'}
                </span>
              </div>
              <PerspectiveSpectrumBar
                perspectives={cluster.perspectives || {}}
                totalOutlets={totalOutlets}
                size="lg"
                showLabels={true}
              />
            </div>

            {/* Coverage Divergence Assessment */}
            {cluster.coverage_divergence && (
              <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs text-slate-600 space-y-1">
                <div className="font-semibold text-slate-800 flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                  Editorial Framing Divergence
                </div>
                <p className="line-clamp-2 text-slate-600 leading-snug">
                  {cluster.coverage_divergence}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={() => onOpenDeepDive(cluster)}
                className="w-full sm:flex-1 py-2.5 px-4 rounded-lg bg-slate-900 text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-2 hover:bg-slate-800 transition shadow-sm"
              >
                <span>Read Multi-Angle Deep Dive</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onAskAI(cluster)}
                className="w-full sm:w-auto py-2.5 px-4 rounded-lg bg-white border border-slate-200 text-slate-800 font-medium text-xs sm:text-sm flex items-center justify-center gap-2 hover:bg-slate-50 transition"
              >
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>Ask AI</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
