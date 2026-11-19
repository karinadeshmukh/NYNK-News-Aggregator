import React, { useEffect, useState } from 'react';
import { Cluster, Article, fetchClusterDetails, askAssistant } from '../services/api';
import { PerspectiveSpectrumBar } from './PerspectiveSpectrumBar';
import { PerspectiveBadge } from './PerspectiveBadge';
import {
  X,
  Layers,
  Sparkles,
  ExternalLink,
  ShieldAlert,
  CheckCircle2,
  Gauge,
  Send,
  Loader2,
  SplitSquareVertical,
  BookOpen,
  Scale,
  BrainCircuit,
  MessageSquare
} from 'lucide-react';

interface DeepDiveReaderDrawerProps {
  cluster: Cluster | null;
  initialTab?: 'comparison' | 'consensus' | 'bias' | 'assistant';
  onClose: () => void;
}

export const DeepDiveReaderDrawer: React.FC<DeepDiveReaderDrawerProps> = ({
  cluster,
  initialTab = 'comparison',
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'comparison' | 'consensus' | 'bias' | 'assistant'>(initialTab);
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedArticleId, setSelectedArticleId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Local Assistant State
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string; citations?: any[] }>>([]);
  const [isAskingAI, setIsAskingAI] = useState(false);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (!cluster) return;

    let isMounted = true;
    setIsLoading(true);

    fetchClusterDetails(cluster.cluster_id)
      .then((data) => {
        if (isMounted) {
          setArticles(data.articles || []);
          if (data.articles && data.articles.length > 0) {
            setSelectedArticleId(data.articles[0].id);
          }
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

  const currentArticle = articles.find((a) => a.id === selectedArticleId) || articles[0];
  const totalOutlets = cluster.article_ids?.length || articles.length || 1;
  const diversityPct = Math.round((cluster.diversity_score || 0.5) * 100);

  const handleSendAssistant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isAskingAI) return;

    const userMsg = query.trim();
    setQuery('');
    setMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
    setIsAskingAI(true);

    try {
      const res = await askAssistant(userMsg, cluster.cluster_id);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: res.answer || 'No direct answer could be generated from available sources.',
          citations: res.citations || []
        }
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `Error: ${err.message || 'Failed to query assistant.'}` }
      ]);
    } finally {
      setIsAskingAI(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-6xl h-[94vh] bg-white rounded-2xl border border-slate-200/90 shadow-2xl flex flex-col overflow-hidden">
        {/* Drawer Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 bg-slate-50/70 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-slate-200 text-slate-800">
                {cluster.topic || 'General News'}
              </span>
              <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                {totalOutlets} Outlets Verified
              </span>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                {diversityPct}% Diversity Score
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-200/80 transition"
              title="Close Reader"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <h2 className="font-serif font-black text-xl sm:text-2xl text-slate-900 leading-tight">
            {cluster.title}
          </h2>

          {/* Spectrum Bar in Header */}
          <div className="max-w-2xl">
            <PerspectiveSpectrumBar
              perspectives={cluster.perspectives || {}}
              totalOutlets={totalOutlets}
              size="md"
              showLabels={true}
            />
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 border-b border-slate-200 pt-2 -mb-2 overflow-x-auto text-xs font-semibold">
            <button
              onClick={() => setActiveTab('comparison')}
              className={`py-2 px-3.5 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'comparison'
                  ? 'border-slate-900 text-slate-900 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <SplitSquareVertical className="w-3.5 h-3.5" />
              <span>Side-by-Side Comparison</span>
            </button>

            <button
              onClick={() => setActiveTab('consensus')}
              className={`py-2 px-3.5 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'consensus'
                  ? 'border-slate-900 text-slate-900 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Consensus & Fact Matrix</span>
            </button>

            <button
              onClick={() => setActiveTab('bias')}
              className={`py-2 px-3.5 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'bias'
                  ? 'border-slate-900 text-slate-900 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Framing & Bias Diagnostics</span>
            </button>

            <button
              onClick={() => setActiveTab('assistant')}
              className={`py-2 px-3.5 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'assistant'
                  ? 'border-slate-900 text-slate-900 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>AI Story Assistant</span>
            </button>
          </div>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-slate-50/40">
          {isLoading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-3 text-slate-500">
              <Loader2 className="w-7 h-7 animate-spin text-slate-700" />
              <span className="text-sm font-medium">Synthesizing verified publisher coverage...</span>
            </div>
          ) : (
            <>
              {/* TAB 1: SIDE-BY-SIDE OUTLET COMPARISON */}
              {activeTab === 'comparison' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-200 pb-2">
                    <span className="font-semibold text-slate-700">
                      Comparing {articles.length} Reporting Sources
                    </span>
                    <span>Scroll horizontally to view all editorial perspectives</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {articles.map((art) => (
                      <div
                        key={art.id}
                        className="bg-white rounded-xl border border-slate-200/90 shadow-card p-5 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-3">
                            <PerspectiveBadge perspective={art.perspective} size="sm" />
                            <span className="text-[11px] text-slate-400">
                              {new Date(art.published_at).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                          </div>

                          <div className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">
                            {art.source_name || (art as any).source}
                          </div>

                          {art.image_url && (
                            <div className="w-full aspect-[16/9] mb-3 rounded-lg overflow-hidden bg-gray-100">
                              <img
                                src={art.image_url}
                                alt={art.title}
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            </div>
                          )}

                          <h3 className="font-serif font-bold text-base text-slate-900 mb-3 leading-snug">
                            {art.title}
                          </h3>

                          <p className="text-xs text-slate-600 leading-relaxed line-clamp-6 mb-4">
                            {art.content}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-[11px] text-slate-500 font-medium">
                            Sentiment: {art.sentiment || 'Neutral'}
                          </span>

                          <a
                            href={art.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1"
                          >
                            <span>Original</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 2: CONSENSUS & FACT MATRIX */}
              {activeTab === 'consensus' && (
                <div className="max-w-4xl mx-auto space-y-6">
                  {/* Consensus Paragraph */}
                  <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
                      <BookOpen className="w-4 h-4 text-blue-700" />
                      Cross-Outlet Consensus Summary
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {cluster.consensus_summary || 'Multi-perspective aggregation actively tracking core developments across all verified reporting outlets.'}
                    </p>
                  </div>

                  {/* Coverage Divergence Analysis */}
                  {cluster.coverage_divergence && (
                    <div className="bg-amber-50/70 rounded-xl border border-amber-200 p-6 shadow-sm space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-900">
                        <ShieldAlert className="w-4 h-4 text-amber-600" />
                        Editorial Divergence Analysis
                      </div>
                      <p className="text-sm text-amber-950 leading-relaxed font-medium">
                        {cluster.coverage_divergence}
                      </p>
                    </div>
                  )}

                  {/* Fact Matrix */}
                  {cluster.key_facts && cluster.key_facts.length > 0 && (
                    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Corroborated Fact Points
                      </div>
                      <div className="space-y-3">
                        {cluster.key_facts.map((fact, idx) => (
                          <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200/60 text-xs sm:text-sm text-slate-800">
                            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-xs">
                              {idx + 1}
                            </span>
                            <span className="leading-relaxed">{fact}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: FRAMING & BIAS DIAGNOSTICS */}
              {activeTab === 'bias' && (
                <div className="max-w-4xl mx-auto space-y-6">
                  {/* Article Selector */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-2">
                    {articles.map((art) => (
                      <button
                        key={art.id}
                        onClick={() => setSelectedArticleId(art.id)}
                        className={`py-1.5 px-3 rounded-lg text-xs font-semibold whitespace-nowrap transition border ${
                          (selectedArticleId === art.id || (!selectedArticleId && art.id === articles[0]?.id))
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {art.source_name || (art as any).source} ({art.perspective})
                      </button>
                    ))}
                  </div>

                  {currentArticle && (
                    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                        <div>
                          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                            Analyzed Article
                          </div>
                          <h3 className="font-serif font-bold text-lg text-slate-900">
                            {currentArticle.title}
                          </h3>
                        </div>
                        <PerspectiveBadge perspective={currentArticle.perspective} />
                      </div>

                      {/* Bias Metrics Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                          <div className="text-xs font-semibold text-slate-500 mb-1">Subjectivity Level</div>
                          <div className="text-xl font-bold text-slate-900">
                            {Math.round((currentArticle.subjectivity ?? 0.3) * 100)}%
                          </div>
                          <div className="text-[11px] text-slate-500 mt-1">
                            {(currentArticle.subjectivity ?? 0.3) > 0.5 ? 'Heavy opinion framing' : 'Fact-heavy reporting'}
                          </div>
                        </div>

                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                          <div className="text-xs font-semibold text-slate-500 mb-1">Sentiment Polarity</div>
                          <div className="text-xl font-bold text-slate-900">
                            {currentArticle.sentiment || 'Neutral'}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-1">
                            Editorial tone analysis
                          </div>
                        </div>

                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                          <div className="text-xs font-semibold text-slate-500 mb-1">Editorial Bias Prior</div>
                          <div className="text-xl font-bold text-slate-900 uppercase">
                            {currentArticle.perspective}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-1">
                            Media outlet baseline classification
                          </div>
                        </div>
                      </div>

                      {/* Named Entities & Word Framing */}
                      {((currentArticle.detected_keywords && currentArticle.detected_keywords.length > 0) || ((currentArticle as any).entities && (currentArticle as any).entities.length > 0)) && (
                        <div>
                          <div className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                            Extracted Key Entities & Framing Keywords
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {(currentArticle.detected_keywords || (currentArticle as any).entities || []).map((ent: string, idx: number) => (
                              <span
                                key={idx}
                                className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200"
                              >
                                {ent}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: AI STORY ASSISTANT */}
              {activeTab === 'assistant' && (
                <div className="max-w-3xl mx-auto flex flex-col h-full space-y-4">
                  <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200 text-xs text-indigo-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>
                      Ask any question about this specific story. Answers are grounded directly in the verified articles from {articles.map(a => a.source_name || (a as any).source).join(', ')}.
                    </span>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-3 min-h-[220px]">
                    {messages.length === 0 ? (
                      <div className="text-center py-12 text-slate-400 space-y-2">
                        <MessageSquare className="w-8 h-8 mx-auto text-slate-300" />
                        <p className="text-sm font-medium">No questions asked yet.</p>
                        <p className="text-xs">Try: "What are the key points of disagreement between Left and Right coverage?"</p>
                      </div>
                    ) : (
                      messages.map((msg, idx) => (
                        <div
                          key={idx}
                          className={`p-4 rounded-xl text-xs sm:text-sm leading-relaxed ${
                            msg.role === 'user'
                              ? 'bg-slate-900 text-white ml-12'
                              : 'bg-white border border-slate-200 text-slate-800 mr-12 shadow-sm'
                          }`}
                        >
                          <div className="font-bold text-[11px] mb-1 opacity-70">
                            {msg.role === 'user' ? 'You' : 'NYNK AI Assistant'}
                          </div>
                          <p>{msg.content}</p>
                          {msg.citations && msg.citations.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                              <span className="font-semibold">Citations: </span>
                              {msg.citations.map((c: any) => typeof c === 'string' ? c : c.source_name || c.title || 'Source').join(', ')}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  <form onSubmit={handleSendAssistant} className="flex items-center gap-2 pt-2">
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Ask the AI assistant about this story..."
                      className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                    />
                    <button
                      type="submit"
                      disabled={isAskingAI || !query.trim()}
                      className="py-2.5 px-5 rounded-xl bg-slate-900 text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 hover:bg-slate-800 disabled:opacity-50 transition"
                    >
                      {isAskingAI ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      <span>Ask</span>
                    </button>
                  </form>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
