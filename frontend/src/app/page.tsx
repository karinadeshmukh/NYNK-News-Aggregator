'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { HagueHeader } from '../components/HagueHeader';
import { HagueTopBroadsheet } from '../components/HagueTopBroadsheet';
import { HagueTopicRow } from '../components/HagueTopicRow';
import { HagueSpotlightRow } from '../components/HagueSpotlightRow';
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
import { Loader2, Search, ArrowRight } from 'lucide-react';

export default function Home() {
  const { user, token, isAuthenticated } = useAuth();

  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [blindspots, setBlindspots] = useState<Blindspot[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string>('All');
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

  // Lead Story
  const leadStory = filteredClusters[0] || null;
  const leftStories = filteredClusters.slice(1, 3);
  const latestStories = filteredClusters.slice(3, 8);

  // Grouped by Topic for Broadsheet Rows
  const techAndEnergyClusters = useMemo(() => {
    return filteredClusters.filter(
      (c) =>
        c.topic?.toLowerCase().includes('tech') ||
        c.topic?.toLowerCase().includes('economy') ||
        c.title.toLowerCase().includes('energy') ||
        c.title.toLowerCase().includes('semi')
    );
  }, [filteredClusters]);

  const governanceClusters = useMemo(() => {
    return filteredClusters.filter(
      (c) =>
        c.topic?.toLowerCase().includes('govern') ||
        c.topic?.toLowerCase().includes('national') ||
        c.title.toLowerCase().includes('bill') ||
        c.title.toLowerCase().includes('voter')
    );
  }, [filteredClusters]);

  const spotlightStory = filteredClusters[8] || filteredClusters[2] || leadStory;
  const subSpotlightStories = filteredClusters.slice(9, 13).length > 0
    ? filteredClusters.slice(9, 13)
    : filteredClusters.slice(0, 4);

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-950">
      {/* Hague Broadsheet Masthead Header */}
      <HagueHeader
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

      {/* MAIN BROADSHEET NEWSPAPER CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {currentView === 'blindspots' ? (
          /* BLINDSPOT RADAR VIEW */
          <BlindspotRadarView
            blindspots={blindspots}
            clusters={clusters}
            onSelectCluster={(c) => handleOpenDeepDive(c, 'comparison')}
          />
        ) : isLoading ? (
          <div className="py-28 flex flex-col items-center justify-center gap-3 text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin text-black" />
            <span className="text-sm font-medium">Loading broadsheet edition...</span>
          </div>
        ) : filteredClusters.length === 0 ? (
          <div className="py-20 text-center text-gray-500 space-y-2">
            <Search className="w-8 h-8 mx-auto text-gray-300" />
            <p className="text-sm font-semibold">No reports match your inquiry.</p>
            <p className="text-xs">Try selecting another topic from the masthead navigation.</p>
          </div>
        ) : searchQuery.trim() || (selectedTopic !== 'All' && selectedTopic !== 'Home') ? (
          /* FILTERED TOPIC VIEW: 4-COLUMN BROADSHEET GRID */
          <div className="space-y-6">
            <div className="border-b border-gray-900 pb-2">
              <h2 className="font-bold text-sm uppercase tracking-wider text-gray-900">
                {searchQuery ? `Search Results: "${searchQuery}"` : `${selectedTopic} Wire`}
              </h2>
            </div>

            <HagueTopicRow
              sectionTitle={`Reports in ${selectedTopic}`}
              clusters={filteredClusters}
              onOpenStory={(c) => handleOpenDeepDive(c, 'comparison')}
            />
          </div>
        ) : (
          /* MAIN BROADHEET NEWSPAPER FRONT PAGE (MATCHING HAGUE IMAGE) */
          <>
            {/* 1. TOP 3-COLUMN HERO BROADSHEET SECTION */}
            {leadStory && (
              <HagueTopBroadsheet
                leadStory={leadStory}
                leftStories={leftStories}
                latestStories={latestStories}
                onOpenStory={(c) => handleOpenDeepDive(c, 'comparison')}
              />
            )}

            {/* 2. BUSINESS & TECHNOLOGY SECTION (4-COLUMN GRID) */}
            <HagueTopicRow
              sectionTitle="Business & Industrial Policy"
              categoryTag="BUSINESS"
              clusters={techAndEnergyClusters.length > 0 ? techAndEnergyClusters : filteredClusters.slice(2, 6)}
              onOpenStory={(c) => handleOpenDeepDive(c, 'comparison')}
              onViewAll={() => setSelectedTopic('Technology')}
            />

            {/* 3. NATIONAL GOVERNANCE SECTION (4-COLUMN GRID) */}
            <HagueTopicRow
              sectionTitle="Governance & Constitutional Oversight"
              categoryTag="GOVERNANCE"
              clusters={governanceClusters.length > 0 ? governanceClusters : filteredClusters.slice(4, 8)}
              onOpenStory={(c) => handleOpenDeepDive(c, 'comparison')}
              onViewAll={() => setSelectedTopic('Governance')}
            />

            {/* 4. ASYMMETRIC MEDIA DIVERGENCE SPOTLIGHT (MATCHING POLITICS SECTION IN IMAGE) */}
            {spotlightStory && (
              <HagueSpotlightRow
                sectionTitle="Politics & Cross-Perspective Analysis"
                featuredStory={spotlightStory}
                subStories={subSpotlightStories}
                onOpenStory={(c) => handleOpenDeepDive(c, 'comparison')}
                onViewAll={() => setCurrentView('blindspots')}
              />
            )}
          </>
        )}
      </main>

      {/* Broadsheet Footer */}
      <footer className="border-t border-gray-200 bg-gray-50 py-10 mt-12 text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <span className="font-serif font-black text-lg text-black tracking-widest uppercase">
              NYNK
            </span>
            <p className="mt-1 text-[11px] text-gray-500">
              News You Need To Know • Transparent Media Intelligence & Framing Verification
            </p>
          </div>
          <div className="text-[11px] text-gray-400">
            Independent AI multi-perspective clustering across official records, left, center wire, and right publishers.
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
