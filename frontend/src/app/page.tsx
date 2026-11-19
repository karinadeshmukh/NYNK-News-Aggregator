'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { MagazineHeader } from '../components/MagazineHeader';
import { MagazineHeroMosaic } from '../components/MagazineHeroMosaic';
import { MagazineMosaicGrid } from '../components/MagazineMosaicGrid';
import { TopStoriesLeaderboard } from '../components/TopStoriesLeaderboard';
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
import { Loader2, Search } from 'lucide-react';

export default function Home() {
  const { user, token, isAuthenticated } = useAuth();

  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [blindspots, setBlindspots] = useState<Blindspot[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string>('All');
  const [mosaicFilter, setMosaicFilter] = useState<string>('All Stories');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentView, setCurrentView] = useState<'feed' | 'blindspots' | 'diet'>('feed');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Deep Dive Reader & Modals
  const [activeDeepDiveCluster, setActiveDeepDiveCluster] = useState<Cluster | null>(null);
  const [deepDiveInitialTab, setDeepDiveInitialTab] = useState<'comparison' | 'consensus' | 'bias' | 'assistant'>('comparison');
  const [isDietModalOpen, setIsDietModalOpen] = useState<boolean>(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState<boolean>(false);
  const [assistantFocusCluster, setAssistantFocusCluster] = useState<Cluster | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

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
        const clusterData = await fetchClusters(topic === 'Home' ? 'All' : topic);
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

  // Lead and secondary stories for Magazine Hero Mosaic
  const leadStory = filteredClusters[0] || null;
  const secondaryStory1 = filteredClusters[1] || null;
  const secondaryStory2 = filteredClusters[2] || null;

  // Filtered for mosaic grid
  const mosaicStories = useMemo(() => {
    let pool = filteredClusters.slice(3);
    if (mosaicFilter === 'High Divergence') {
      return pool.filter((c) => (c.diversity_score || 0) > 0.7);
    }
    if (mosaicFilter === 'Economy') {
      return pool.filter((c) => c.topic?.toLowerCase().includes('economy'));
    }
    if (mosaicFilter === 'Governance') {
      return pool.filter((c) => c.topic?.toLowerCase().includes('govern'));
    }
    if (mosaicFilter === 'Technology') {
      return pool.filter((c) => c.topic?.toLowerCase().includes('tech'));
    }
    return pool;
  }, [filteredClusters, mosaicFilter]);

  // Ranked Top Stories for Sidebar
  const leaderboardStories = useMemo(() => {
    return [...filteredClusters].sort((a, b) => (b.article_ids?.length || 1) - (a.article_ids?.length || 1));
  }, [filteredClusters]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50/50 text-gray-900">
      {/* USA TODAY / JANNAH STYLE HEADER */}
      <MagazineHeader
        currentView={currentView}
        onSelectView={handleSelectView}
        selectedTopic={selectedTopic}
        onSelectTopic={setSelectedTopic}
        onToggleAssistant={() => {
          setAssistantFocusCluster(null);
          setIsAssistantOpen(!isAssistantOpen);
        }}
        onRefresh={handleRefresh}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        isRefreshing={isRefreshing}
        blindspotCount={blindspots.length}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {currentView === 'blindspots' ? (
          /* BLINDSPOT RADAR VIEW */
          <BlindspotRadarView
            blindspots={blindspots}
            clusters={clusters}
            onSelectCluster={(c) => handleOpenDeepDive(c, 'comparison')}
          />
        ) : isLoading ? (
          <div className="py-28 flex flex-col items-center justify-center gap-3 text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin text-[#0091FF]" />
            <span className="text-sm font-semibold text-gray-600">Loading live intelligence edition...</span>
          </div>
        ) : filteredClusters.length === 0 ? (
          <div className="py-20 text-center text-gray-500 space-y-2">
            <Search className="w-8 h-8 mx-auto text-gray-300" />
            <p className="text-sm font-semibold">No reports match your inquiry.</p>
            <p className="text-xs">Try selecting another topic from the category navigation bar.</p>
          </div>
        ) : searchQuery.trim() || (selectedTopic !== 'All' && selectedTopic !== 'Home' && selectedTopic !== 'News') ? (
          /* FILTERED TOPIC / SEARCH VIEW */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 space-y-6">
              <div className="border-b border-gray-900 pb-2">
                <h2 className="font-sans font-black text-sm uppercase tracking-wider text-black">
                  {searchQuery ? `Search Results: "${searchQuery}"` : `${selectedTopic} Coverage`}
                </h2>
              </div>
              <MagazineMosaicGrid
                sectionTitle={`All Verified Stories in ${selectedTopic}`}
                clusters={filteredClusters}
                activeFilter={mosaicFilter}
                onSelectFilter={setMosaicFilter}
                onOpenStory={(c) => handleOpenDeepDive(c, 'comparison')}
              />
            </div>
            <div className="lg:col-span-4">
              <TopStoriesLeaderboard
                topStories={leaderboardStories}
                recentStories={filteredClusters.slice(0, 5)}
                onOpenStory={(c) => handleOpenDeepDive(c, 'comparison')}
              />
            </div>
          </div>
        ) : (
          /* FULL USA TODAY + JANNAH STYLE MAGAZINE HOMEPAGE */
          <>
            {/* 1. HERO MOSAIC (1 Giant Feature with quotes + 2 Stacked Tiles) */}
            {leadStory && (
              <MagazineHeroMosaic
                leadStory={leadStory}
                secondaryStory1={secondaryStory1}
                secondaryStory2={secondaryStory2}
                onOpenStory={(c) => handleOpenDeepDive(c, 'comparison')}
              />
            )}

            {/* 2. MAIN 2-COLUMN SPLIT: MOSAIC FEED ON LEFT, NUMBERED LEADERBOARD ON RIGHT */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column (8 cols): USA Today "Last News" Mosaic Grid */}
              <div className="lg:col-span-8 space-y-8">
                <MagazineMosaicGrid
                  sectionTitle="Latest News & Perspective Matrix"
                  clusters={mosaicStories.length > 0 ? mosaicStories : filteredClusters}
                  activeFilter={mosaicFilter}
                  onSelectFilter={setMosaicFilter}
                  onOpenStory={(c) => handleOpenDeepDive(c, 'comparison')}
                />
              </div>

              {/* Right Column (4 cols): Numbered 1-5 Top Stories + Live Stream */}
              <div className="lg:col-span-4">
                <TopStoriesLeaderboard
                  topStories={leaderboardStories}
                  recentStories={filteredClusters.slice(0, 5)}
                  onOpenStory={(c) => handleOpenDeepDive(c, 'comparison')}
                />
              </div>
            </div>
          </>
        )}
      </main>

      {/* Modern Magazine Footer */}
      <footer className="border-t border-gray-200 bg-white py-8 mt-12 text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-[#0091FF] flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
            </div>
            <span className="font-sans font-black text-sm text-black tracking-tight uppercase">
              NYNK Intelligence
            </span>
            <span className="text-gray-300">|</span>
            <span className="text-[11px] text-gray-500">
              Direct Publisher RSS Media Ingestion • Explainable Bias & Framing
            </span>
          </div>
          <div className="text-[11px] text-gray-400">
            Powered by FastAPI microservice clustering & Node.js gateway.
          </div>
        </div>
      </footer>

      {/* Slide-over Deep Dive Reader Drawer */}
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
