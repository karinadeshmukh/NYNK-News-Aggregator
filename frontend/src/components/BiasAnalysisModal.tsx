import React, { useEffect, useState } from 'react';
import { Cluster, Article, fetchClusterDetails } from '../services/api';
import { PerspectiveBadge } from './PerspectiveBadge';
import { X, Gauge, ShieldAlert, Sparkles, Tag, BrainCircuit } from 'lucide-react';

interface BiasAnalysisModalProps {
  cluster: Cluster | null;
  onClose: () => void;
}

export const BiasAnalysisModal: React.FC<BiasAnalysisModalProps> = ({ cluster, onClose }) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedArticleId, setSelectedArticleId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!cluster) return;
    setLoading(true);

    fetchClusterDetails(cluster.cluster_id)
      .then((data) => {
        setArticles(data.articles || []);
        if (data.articles && data.articles.length > 0) {
          setSelectedArticleId(data.articles[0].id);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [cluster]);

  if (!cluster) return null;

  const currentArticle = articles.find((a) => a.id === selectedArticleId) || articles[0];
  const subjectivityPct = Math.round((currentArticle?.subjectivity || 0.35) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-4xl max-h-[92vh] bg-cream-50 border-2 border-slate-900 rounded-3xl shadow-retro-lg flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-900/10 flex items-start justify-between bg-white">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-[#DBEAFE] text-sky-950 border border-sky-300">
                Explainable Media Bias & Framing
              </span>
            </div>
            <h2 className="font-serif font-black text-xl sm:text-2xl text-slate-900">{cluster.title}</h2>
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
          {/* Article Selector Tabs */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-2">
              Choose an Outlet to Inspect Framing Factors:
            </label>
            <div className="flex flex-wrap gap-2">
              {articles.map((art) => (
                <button
                  key={art.id}
                  onClick={() => setSelectedArticleId(art.id)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition flex items-center gap-2 border ${
                    art.id === selectedArticleId
                      ? 'bg-slate-900 text-white border-slate-900 shadow-retro-sm'
                      : 'bg-white text-slate-800 hover:bg-cream-200 border-slate-300'
                  }`}
                >
                  <span>{art.source_name}</span>
                  <PerspectiveBadge perspective={art.perspective} showIcon={false} />
                </button>
              ))}
            </div>
          </div>

          {currentArticle && (
            <div className="space-y-6">
              {/* Headline & Baseline */}
              <div className="p-5 rounded-2xl bg-white border-2 border-slate-900/15 shadow-retro-sm">
                <div className="flex justify-between items-center gap-2 mb-2">
                  <span className="text-xs font-bold text-slate-700">{currentArticle.source_name}</span>
                  <PerspectiveBadge perspective={currentArticle.perspective} />
                </div>
                <h4 className="font-serif font-bold text-lg text-slate-900 mb-2">
                  {currentArticle.title}
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {currentArticle.content || currentArticle.summary}
                </p>
              </div>

              {/* Bias Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Perspective Score */}
                <div className="p-5 rounded-2xl bg-[#E8DFF5] border border-purple-300 shadow-sm flex flex-col justify-between">
                  <div className="text-xs font-bold text-purple-950 uppercase tracking-wide mb-1">Perspective Category</div>
                  <div className="text-lg font-bold text-slate-900 my-2">
                    <PerspectiveBadge perspective={currentArticle.perspective} />
                  </div>
                  <div className="text-xs text-purple-900 font-medium">
                    Determined via publisher baseline history and framing keywords.
                  </div>
                </div>

                {/* Subjectivity Gauge */}
                <div className="p-5 rounded-2xl bg-[#DCFCE7] border border-emerald-300 shadow-sm flex flex-col justify-between">
                  <div className="flex justify-between items-center text-xs font-bold text-emerald-950 uppercase tracking-wide mb-1">
                    <span>Subjectivity</span>
                    <span className="font-extrabold text-sm text-emerald-950">{subjectivityPct}%</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-white border border-emerald-300 overflow-hidden my-2">
                    <div
                      style={{ width: `${subjectivityPct}%` }}
                      className={`h-full ${
                        subjectivityPct > 60
                          ? 'bg-amber-500'
                          : subjectivityPct > 35
                          ? 'bg-sky-500'
                          : 'bg-emerald-600'
                      }`}
                    />
                  </div>
                  <div className="text-xs text-emerald-900 font-medium">
                    {subjectivityPct < 30
                      ? 'Predominantly factual and informational reporting.'
                      : subjectivityPct < 60
                      ? 'Balanced mix of facts and analytical commentary.'
                      : 'High opinion or strong editorial rhetoric detected.'}
                  </div>
                </div>

                {/* Sentiment & Tone */}
                <div className="p-5 rounded-2xl bg-[#FDE2E4] border border-rose-300 shadow-sm flex flex-col justify-between">
                  <div className="text-xs font-bold text-rose-950 uppercase tracking-wide mb-1">Framing Sentiment</div>
                  <div className="text-base font-bold text-slate-900 flex items-center gap-2 my-2">
                    <Gauge className="w-4 h-4 text-rose-700" />
                    <span>{currentArticle.sentiment || 'Analytical Neutral'}</span>
                  </div>
                  <div className="text-xs text-rose-900 font-medium">
                    Extracted from vocabulary sentiment polarity and emotive tone.
                  </div>
                </div>
              </div>

              {/* Detected Framing Cues & Keywords */}
              <div className="p-5 rounded-2xl bg-white border border-slate-900/15 shadow-sm">
                <div className="text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-slate-900" />
                  Detected Editorial Framing Markers & Keywords
                </div>
                <div className="flex flex-wrap gap-2">
                  {(currentArticle.detected_keywords && currentArticle.detected_keywords.length > 0
                    ? currentArticle.detected_keywords
                    : ['sovereignty', 'policy', 'milestone', 'oversight', 'incentive']
                  ).map((kw, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-full text-xs font-bold bg-cream-200 text-slate-800 border border-slate-300"
                    >
                      #{kw}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-900/10 bg-white flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-full text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition shadow-retro-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
