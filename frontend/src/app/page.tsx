'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Header } from '../components/Header';
import { TopicFilter } from '../components/TopicFilter';
import { ClusterCard } from '../components/ClusterCard';
import { HeroLeadStory } from '../components/HeroLeadStory';
import { DeepDiveReaderDrawer } from '../components/DeepDiveReaderDrawer';
import { BlindspotRadarView } from '../components/BlindspotRadarView';
import { MyNewsDietModal } from '../components/MyNewsDietModal';
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
import {
  Sparkles,
  Layers,
  Search,
  Compass,
  RefreshCw,
  Loader2,
  SlidersHorizontal,
  Flame,
  ShieldCheck
} from 'lucide-react';

const BASE_TOPICS = ['All', 'Technology', 'Economy', 'Governance', 'National', 'World'];

export default function Home() {
  const { user, token, isAuthenticated } = useAuth();

  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [blindspots, setBlindspots] = useState<Blindspot[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentView, setCurrentView] = useState<'feed' | 'blindspots' | 'diet'>('feed');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Deep Dive Reader Drawer & Modals
  const [activeDeepDiveCluster, setActiveDeepDiveCluster] = useState<Cluster | null>(null);
  const [deepDiveInitialTab, setDeepDiveInitialTab] = useState<'comparison' | 'consensus' | 'bias' | 'assistant'>('comparison');
  const [isDietModalOpen, setIsDietModalOpen] = useState<boolean>(false);
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

  const handleOpenDeepDive = (cluster: Cluster, tab: 'comparison' | 'consensus' | 'bias' | 'assistant' = 'comparison') => {
    setActiveDeepDiveCluster(cluster);
    setDeepDiveInitialTab(tab);
  };

  const handleAskAI = (cluster: Cluster) => {
    setAssistantFocusCluster(cluster);
    setIsAssistantOpen(true);
  };

  const handleSelectView = (view: 'feed' | 'blindspots' | 'diet') => {
    if (view === 'diet') {
      setIsDietModalOpen(true);
      return;
    }
    setCurrentView(view);
  };

  // Filtered clusters by search
  const filteredClusters = useMemo(() => {
    if (!searchQuery.trim()) return clusters;
    const q = searchQuery.toLowerCase();
    return clusters.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        (c.topic && c.topic.toLowerCase().includes(q)) ||
        (c.consensus_summary && c.consensus_summary.toLowerCase().includes(q))
    );
  }, [clusters, searchQuery]);

  // Lead Featured Story (highest outlet count / diversity)
  const leadStory = useMemo(() => {
    if (filteredClusters.length === 0) return null;
    return filteredClusters.reduce((prev, curr) => {
      const prevScore = (prev.article_ids?.length || 1) * (prev.diversity_score || 0.5);
      const currScore = (curr.article_ids?.length || 1) * (curr.diversity_score || 0.5);
      return currScore > prevScore ? curr : prev;
    }, filteredClusters[0]);
  }, [filteredClusters]);

  // Remaining stories excluding lead story if in feed view and no search query
  const gridStories = useMemo(() => {
    if (searchQuery.trim() || !leadStory) return filteredClusters;
    return filteredClusters.filter((c) => c.cluster_id !== leadStory.cluster_id);
  }, [filteredClusters, leadStory, searchQuery]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Navigation */}
      <Header
        currentView={currentView}
        onSelectView={handleSelectView}
        onToggleAssistant={() => {
          setAssistantFocusCluster(null);
          setIsAssistantOpen(!isAssistantOpen);
        }}
        onRefresh={handleRefresh}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        isRefreshing={isRefreshing}
        totalClusters={clusters.length}
        blindspotCount={blindspots.length}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Editorial Intelligence Ticker */}
      <div className="bg-white border-b border-slate-200/80 py-2 overflow-hidden select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2 shrink-0 pr-4">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold uppercase tracking-wider text-slate-700 text-[11px]">Wire Ticker:</span>
          </div>
          <div className="overflow-hidden relative w-full">
            <div className="animate-ticker flex items-center gap-8 text-[11px] font-medium text-slate-600 whitespace-nowrap">
              <span>✦ Official Records (Press Information Bureau)</span>
              <span>✦ Wire Dispatches (Reuters, PTI)</span>
              <span>✦ National Dailies (The Hindu, Indian Express, TOI)</span>
              <span>✦ Independent Analysis (The Wire, Swarajya, Firstpost, OpIndia)</span>
              <span>✦ Real-Time Semantic Clustering</span>
              <span>✦ Framing Asymmetry Radar</span>
              <span>✦ Official Records (Press Information Bureau)</span>
              <span>✦ Wire Dispatches (Reuters, PTI)</span>
              <span>✦ National Dailies (The Hindu, Indian Express, TOI)</span>
              <span>✦ Independent Analysis (The Wire, Swarajya, Firstpost, OpIndia)</span>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN VIEW CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {currentView === 'blindspots' ? (
          /* BLINDSPOT RADAR VIEW */
          <BlindspotRadarView
            blindspots={blindspots}
            clusters={clusters}
            onSelectCluster={(c) => handleOpenDeepDive(c, 'comparison')}
          />
        ) : (
          /* REGULAR STORIES FEED VIEW */
          <>
            {/* Lead Story Spotlight (only when no search query active) */}
            {!searchQuery.trim() && leadStory && selectedTopic === 'All' && (
              <HeroLeadStory
                cluster={leadStory}
                onOpenDeepDive={(c) => handleOpenDeepDive(c, 'comparison')}
                onAskAI={handleAskAI}
              />
            )}

            {/* Section Controls: Topic Pills & Stats */}
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
              <div>
                <h2 className="font-serif font-bold text-2xl text-slate-900 tracking-tight flex items-center gap-2">
                  <Flame className="w-5 h-5 text-rose-600" />
                  <span>{searchQuery ? `Search Results: "${searchQuery}"` : "Today's Verified Clustered Stories"}</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Comparing reporting angles across {clusters.length} multi-sourced news events. Flip perspectives directly on any card.
                </p>
              </div>

              {/* Topic Filters */}
              <TopicFilter
                selectedTopic={selectedTopic}
                onSelectTopic={setSelectedTopic}
                availableTopics={activeTopics}
              />
            </div>

            {/* Stories Grid */}
            {isLoading ? (
              <div className="py-24 flex flex-col items-center justify-center gap-3 text-slate-500">
                <Loader2 className="w-8 h-8 animate-spin text-slate-700" />
                <span className="text-sm font-semibold">Aggregating multi-perspective coverage...</span>
              </div>
            ) : gridStories.length === 0 ? (
              <div className="py-16 text-center bg-white rounded-xl border border-slate-200 text-slate-500 space-y-2">
                <Search className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-sm font-semibold">No stories match your criteria.</p>
                <p className="text-xs">Try selecting another topic filter or clearing your search query.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {gridStories.map((cluster, idx) => (
                  <ClusterCard
                    key={cluster.cluster_id || idx}
                    cluster={cluster}
                    index={idx}
                    onOpenDeepDive={(c) => handleOpenDeepDive(c, 'comparison')}
                    onAskAI={handleAskAI}
                    onRequireAuth={() => setIsAuthModalOpen(true)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Split-Screen Deep Dive Reader Drawer */}
      <DeepDiveReaderDrawer
        cluster={activeDeepDiveCluster}
        initialTab={deepDiveInitialTab}
        onClose={() => setActiveDeepDiveCluster(null)}
      />

      {/* My News Diet Modal */}
      <MyNewsDietModal
        isOpen={isDietModalOpen}
        onClose={() => setIsDietModalOpen(false)}
        clusters={clusters}
        onSelectCluster={(c) => {
          setIsDietModalOpen(false);
          handleOpenDeepDive(c, 'comparison');
        }}
      />

      {/* Global AI Newsroom Assistant Drawer */}
      <AssistantDrawer
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        activeCluster={assistantFocusCluster}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}
