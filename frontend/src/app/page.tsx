'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { TopicFilter } from '../components/TopicFilter';
import { ClusterCard } from '../components/ClusterCard';
import { StoryComparisonModal } from '../components/StoryComparisonModal';
import { BiasAnalysisModal } from '../components/BiasAnalysisModal';
import { BlindspotAlertBanner } from '../components/BlindspotAlertBanner';
import { AssistantDrawer } from '../components/AssistantDrawer';
import { AuthModal } from '../components/AuthModal';
import { useAuth } from '../context/AuthContext';
import {
  Cluster,
  Blindspot,
  fetchClusters,
  fetchBlindspots,
  fetchPersonalizedClusters
} from '../services/api';
import { Sparkles, Bookmark, User, Compass } from 'lucide-react';

const BASE_TOPICS = ['All', 'Technology', 'Economy', 'Governance', 'National', 'World'];

export default function Home() {
  const { user, token, isAuthenticated } = useAuth();

  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [blindspots, setBlindspots] = useState<Blindspot[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string>('All');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Modals & Drawers
  const [comparingCluster, setComparingCluster] = useState<Cluster | null>(null);
  const [inspectingCluster, setInspectingCluster] = useState<Cluster | null>(null);
  const [isAssistantOpen, setIsAssistantOpen] = useState<boolean>(false);
  const [assistantFocusCluster, setAssistantFocusCluster] = useState<Cluster | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Active topic list with personalized options when authenticated
  const activeTopics = isAuthenticated
    ? ['For You', 'Saved Stories', ...BASE_TOPICS]
    : BASE_TOPICS;

  const loadData = async (topic: string = selectedTopic) => {
    setIsLoading(true);
    try {
      const blindspotData = await fetchBlindspots();
      setBlindspots(blindspotData);

      if (topic === 'For You' && token) {
        const personalized = await fetchPersonalizedClusters(token);
        setClusters(personalized);
      } else if (topic === 'Saved Stories') {
        const allClusters = await fetchClusters();
        const savedIds = user?.bookmarked_cluster_ids || [];
        setClusters(allClusters.filter((c) => savedIds.includes(c.cluster_id)));
      } else {
        const clusterData = await fetchClusters(topic);
        setClusters(clusterData);
      }
    } catch (e) {
      console.error('Failed to load news intelligence data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData(selectedTopic);
  }, [selectedTopic, user?.bookmarked_cluster_ids]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetch('http://localhost:5000/api/news/ingest', { method: 'POST' }).catch(() => {});
      await loadData(selectedTopic);
    } catch (e) {
      console.error(e);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleOpenComparison = (cluster: Cluster) => {
    setComparingCluster(cluster);
  };

  const handleInspectBias = (cluster: Cluster) => {
    setInspectingCluster(cluster);
  };

  const handleAskAI = (cluster: Cluster) => {
    setAssistantFocusCluster(cluster);
    setIsAssistantOpen(true);
  };

  return (
    <div className="flex-1 flex flex-col bg-cream-100">
      {/* Top Navigation */}
      <Header
        onToggleAssistant={() => {
          setAssistantFocusCluster(null);
          setIsAssistantOpen(!isAssistantOpen);
        }}
        onRefresh={handleRefresh}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        isRefreshing={isRefreshing}
        totalClusters={clusters.length}
      />

      {/* HERO SECTION */}
      <section className="bg-graph-paper border-b-2 border-slate-900/10 pt-16 pb-20 px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          {/* Top sticker badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-[#FDE2E4] border border-rose-300 text-rose-950 uppercase tracking-wider mb-6 shadow-sm">
            <span>⚡ MULTIPERSPECTIVE NEWS INTELLIGENCE</span>
          </div>

          {/* Chunky Editorial Hero Headline with Tape Effect */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-black text-slate-900 tracking-tight leading-[1.08] mb-6">
            the news <br />
            <span className="bg-[#FDE2E4] px-4 py-1 inline-block -rotate-1 rounded-sm border border-rose-200 shadow-sm text-slate-900 my-1">
              for critical thinkers
            </span> <br />
            from every angle.
          </h1>

          {/* Subtitle */}
          <div className="max-w-2xl mx-auto space-y-3 mb-8">
            <p className="text-sm sm:text-base font-serif font-bold text-slate-800 tracking-wide uppercase">
              For The Overwhelmed, The Echo-Chamber Exhausted, And The Genuinely Curious.
            </p>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              NYNK automatically compares coverage across Official government records (PIB), Left, Center, and Right media outlets to detect editorial framing differences and highlight coverage blindspots.
            </p>
          </div>

          {/* Pill CTA buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => {
                setAssistantFocusCluster(null);
                setIsAssistantOpen(true);
              }}
              className="px-8 py-3 rounded-full text-xs sm:text-sm font-black text-slate-900 bg-white border-2 border-slate-900 shadow-retro hover:translate-x-0.5 hover:translate-y-0.5 transition flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-rose-500" />
              <span>Explore With AI Assistant</span>
            </button>

            {!isAuthenticated && (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="px-6 py-3 rounded-full text-xs sm:text-sm font-bold text-slate-900 bg-[#E8DFF5] border-2 border-slate-900 shadow-retro-sm hover:translate-x-0.5 hover:translate-y-0.5 transition flex items-center gap-1.5"
              >
                <User className="w-4 h-4" />
                <span>Join NYNK Club</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* MARQUEE RUNNING TAPE */}
      <div className="bg-[#DCFCE7] border-y-2 border-slate-900/15 py-3 overflow-hidden select-none">
        <div className="animate-marquee flex items-center gap-8 text-xs sm:text-sm font-extrabold uppercase tracking-widest text-slate-900">
          <span>✦ NEWS YOU NEED TO KNOW</span>
          <span>✦ PRESS INFORMATION BUREAU (PIB)</span>
          <span>✦ LEFT CRITIQUE</span>
          <span>✦ CENTER WIRE</span>
          <span>✦ RIGHT PERSPECTIVE</span>
          <span>✦ REAL-TIME CLUSTERING</span>
          <span>✦ BLINDSPOT RADAR</span>
          <span>✦ ZERO ECHO CHAMBERS</span>
          <span>✦ EXPLAINABLE FRAMING METRICS</span>
          <span>✦ NEWS YOU NEED TO KNOW</span>
          <span>✦ PRESS INFORMATION BUREAU (PIB)</span>
          <span>✦ LEFT CRITIQUE</span>
          <span>✦ CENTER WIRE</span>
          <span>✦ RIGHT PERSPECTIVE</span>
          <span>✦ REAL-TIME CLUSTERING</span>
          <span>✦ BLINDSPOT RADAR</span>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <main id="feed" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Blindspot Radar Banner */}
        <BlindspotAlertBanner
          blindspots={blindspots}
          onSelectCluster={(clusterId) => {
            const found = clusters.find((c) => c.cluster_id === clusterId);
            if (found) handleOpenComparison(found);
          }}
        />

        {/* Section Header: Stories Row */}
        <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-block px-3 py-1 rounded-md bg-[#DBEAFE] border border-sky-300 text-xs font-bold text-sky-950 uppercase tracking-wider mb-2">
              Multi-Angle Clustered Stories
            </div>
            <h2 className="font-serif font-black text-2xl sm:text-3xl text-slate-900 tracking-tight">
              Today's Key Developments
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Select any story to compare headlines, inspect framing bias, or query the AI assistant.
            </p>
          </div>

          {/* Topic Filters */}
          <TopicFilter
            selectedTopic={selectedTopic}
            onSelectTopic={setSelectedTopic}
            availableTopics={activeTopics}
          />
        </div>

        {/* Story Clusters Pastel Cards Grid */}
        {isLoading ? (
          <div className="py-24 text-center flex flex-col items-center justify-center">
            <div className="w-9 h-9 rounded-full border-3 border-slate-900 border-t-transparent animate-spin mb-4" />
            <p className="font-serif font-bold text-slate-800">Synthesizing multi-perspective news clusters...</p>
          </div>
        ) : clusters.length === 0 ? (
          <div className="py-20 text-center rounded-3xl bg-white border-2 border-slate-900/10 p-8 shadow-sm">
            <p className="font-serif font-bold text-lg text-slate-800 mb-1">
              {selectedTopic === 'Saved Stories'
                ? 'No saved stories yet'
                : 'No clusters in this category'}
            </p>
            <p className="text-xs text-slate-500">
              {selectedTopic === 'Saved Stories'
                ? 'Click the bookmark ribbon on any story card to save it to your personal reading list.'
                : 'Try selecting "All" or click "Sync Feeds" above.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clusters.map((cluster, idx) => (
              <ClusterCard
                key={cluster.cluster_id}
                cluster={cluster}
                index={idx}
                onCompare={handleOpenComparison}
                onInspectBias={handleInspectBias}
                onAskAI={handleAskAI}
                onRequireAuth={() => setIsAuthModalOpen(true)}
              />
            ))}
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="mt-20 border-t-2 border-slate-900/10 bg-graph-paper-pink py-12 text-center text-slate-800">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center gap-4">
          <div className="font-serif font-black text-3xl text-slate-900 tracking-tight">
            nynk.
          </div>
          <p className="text-xs sm:text-sm font-medium text-slate-700 max-w-lg">
            Empowering informed decision-making through explainable media balance, transparent AI, and multi-perspective journalism.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-bold uppercase text-slate-700 pt-2">
            <span>• Press Information Bureau (PIB)</span>
            <span>• National Dailies</span>
            <span>• Independent Digital Media</span>
            <span>• Semantic Embeddings</span>
          </div>
          <p className="text-[11px] text-slate-500 pt-4">
            © 2026 NYNK Intelligence. All perspectives accounted for.
          </p>
        </div>
      </footer>

      {/* Story Comparison Modal */}
      <StoryComparisonModal
        cluster={comparingCluster}
        onClose={() => setComparingCluster(null)}
      />

      {/* Bias Analysis Inspector Modal */}
      <BiasAnalysisModal
        cluster={inspectingCluster}
        onClose={() => setInspectingCluster(null)}
      />

      {/* AI News Assistant Drawer */}
      <AssistantDrawer
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        activeCluster={assistantFocusCluster}
      />

      {/* Authentication & Registration Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}
