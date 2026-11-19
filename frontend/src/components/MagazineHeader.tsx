import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  RefreshCw,
  Sparkles,
  Compass,
  PieChart,
  User,
  LogOut,
  Flame,
  TrendingUp,
  Clock
} from 'lucide-react';

interface MagazineHeaderProps {
  currentView: 'feed' | 'blindspots' | 'diet';
  onSelectView: (view: 'feed' | 'blindspots' | 'diet') => void;
  selectedTopic: string;
  onSelectTopic: (topic: string) => void;
  onToggleAssistant: () => void;
  onRefresh: () => void;
  onOpenAuth: () => void;
  isRefreshing: boolean;
  blindspotCount: number;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

const CATEGORIES = ['News', 'Technology', 'Economy', 'Governance', 'National', 'World'];

export const MagazineHeader: React.FC<MagazineHeaderProps> = ({
  currentView,
  onSelectView,
  selectedTopic,
  onSelectTopic,
  onToggleAssistant,
  onRefresh,
  onOpenAuth,
  isRefreshing,
  blindspotCount,
  searchQuery,
  onSearchChange
}) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  return (
    <header className="w-full bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      {/* Top Utility Bar: USA Today / Newsmag Style */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        {/* Brand: NYNK with Blue Dot Icon (USA Today inspired) */}
        <div className="flex items-center gap-3 shrink-0">
          <div
            onClick={() => {
              onSelectView('feed');
              onSelectTopic('All');
            }}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#0091FF] flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <span className="w-2.5 h-2.5 rounded-full bg-white" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-sans font-black text-2xl sm:text-3xl tracking-tighter text-black uppercase">
                NYNK
              </span>
              <span className="hidden sm:inline-block font-sans font-extrabold text-[11px] tracking-widest text-[#0091FF] uppercase">
                INTELLIGENCE
              </span>
            </div>
          </div>
        </div>

        {/* Search Bar in Header (USA Today Center Search Input) */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search news, topics, or publishers..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-full bg-gray-100 hover:bg-gray-150 focus:bg-white border border-gray-200 focus:border-[#0091FF] focus:outline-none transition text-gray-900"
            />
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Sync Feeds */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Sync Live RSS Feeds"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-800 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#0091FF]' : 'text-gray-600'}`} />
            <span className="hidden lg:inline">Sync Feeds</span>
          </button>

          {/* AI Assistant */}
          <button
            onClick={onToggleAssistant}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-slate-900 hover:bg-black text-white transition shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>AI Newsroom</span>
          </button>

          {/* Auth Button */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2 pl-3 pr-1.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-900 text-xs font-bold hover:bg-blue-100 transition"
              >
                <span>{user?.name?.split(' ')[0]}</span>
                <div className="w-6 h-6 rounded-full bg-[#0091FF] text-white flex items-center justify-center font-bold text-[11px]">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              </button>

              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-xl py-1.5 z-50 text-xs">
                  <div className="px-3 py-2 border-b border-gray-100">
                    <p className="font-bold text-gray-900">{user?.name}</p>
                    <p className="text-gray-500 text-[11px] truncate">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      onSelectView('diet');
                      setShowUserDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <PieChart className="w-3.5 h-3.5 text-blue-600" />
                    <span>My News Diet</span>
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      setShowUserDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-gray-100"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-4 py-1.5 rounded-full bg-[#0091FF] hover:bg-blue-600 text-white text-xs font-bold tracking-wide transition shadow-sm"
            >
              Sign In
            </button>
          )}
        </div>
      </div>

      {/* Primary Category Navigation Bar (USA Today Bold Black Sub-Nav) */}
      <div className="border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between overflow-x-auto scrollbar-none py-2 text-xs font-bold uppercase tracking-wider text-gray-700 whitespace-nowrap">
          <div className="flex items-center gap-6 sm:gap-8">
            {CATEGORIES.map((cat) => {
              const isAll = cat === 'News';
              const isSelected = isAll
                ? currentView === 'feed' && selectedTopic === 'All'
                : currentView === 'feed' && selectedTopic.toLowerCase() === cat.toLowerCase();

              return (
                <button
                  key={cat}
                  onClick={() => {
                    onSelectView('feed');
                    onSelectTopic(isAll ? 'All' : cat);
                  }}
                  className={`py-1 transition hover:text-black ${
                    isSelected
                      ? 'text-[#0091FF] font-black border-b-2 border-[#0091FF] -mb-2 pb-1'
                      : 'text-gray-700'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-4 pl-4 border-l border-gray-200 shrink-0">
            {/* Blindspot Radar Pill */}
            <button
              onClick={() => onSelectView('blindspots')}
              className={`py-1 flex items-center gap-1.5 transition ${
                currentView === 'blindspots'
                  ? 'text-rose-600 font-black border-b-2 border-rose-600 -mb-2 pb-1'
                  : 'text-rose-600 hover:text-rose-700'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Blindspot Radar</span>
              {blindspotCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center">
                  {blindspotCount}
                </span>
              )}
            </button>

            {/* My News Diet */}
            <button
              onClick={() => onSelectView('diet')}
              className={`py-1 flex items-center gap-1.5 transition ${
                currentView === 'diet'
                  ? 'text-blue-600 font-black border-b-2 border-blue-600 -mb-2 pb-1'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              <PieChart className="w-3.5 h-3.5 text-blue-600" />
              <span>Diet</span>
            </button>
          </div>
        </div>
      </div>

      {/* Breaking News Mini-Snippet Strip (USA Today Top 4 Teasers) */}
      <div className="bg-gray-50 border-t border-b border-gray-200 py-1.5 text-xs text-gray-600 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-red-600 text-white shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            Live Wire
          </span>
          <div className="overflow-hidden relative w-full">
            <div className="animate-ticker flex items-center gap-8 text-[11px] font-medium text-gray-700 whitespace-nowrap">
              <span>✦ Semiconductor Mission 2.0: Official Cabinet PIB release corroborated across wire services</span>
              <span>✦ Clean Energy: India hits 200 GW milestone, Left media analyzes distribution bottlenecks</span>
              <span>✦ Electoral Reform: High divergence detected between Right and Center coverage</span>
              <span>✦ Transparent Multi-Perspective AI Clustering across Official, Left, Center, and Right</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
