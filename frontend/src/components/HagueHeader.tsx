import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Menu,
  Search,
  Sun,
  User,
  LogOut,
  RefreshCw,
  Sparkles,
  Compass,
  PieChart
} from 'lucide-react';

interface HagueHeaderProps {
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

const NAV_TOPICS = ['Home', 'National', 'Governance', 'Economy', 'Technology', 'World'];

export const HagueHeader: React.FC<HagueHeaderProps> = ({
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
  const [showSearch, setShowSearch] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  return (
    <header className="w-full bg-white border-b border-gray-200">
      {/* Top Utility Masthead Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
        {/* Left Icons: Menu, Search, Theme */}
        <div className="flex items-center gap-4 text-gray-700">
          <button
            onClick={() => onSelectView('feed')}
            title="Menu"
            className="hover:text-black transition"
          >
            <Menu className="w-5 h-5" />
          </button>

          <button
            onClick={() => setShowSearch(!showSearch)}
            title="Search news"
            className="hover:text-black transition"
          >
            <Search className="w-4 h-4" />
          </button>

          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Sync live feeds"
            className="hover:text-black transition disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        </div>

        {/* Center: Iconic Broadsheet Masthead */}
        <div className="text-center">
          <div
            onClick={() => {
              onSelectView('feed');
              onSelectTopic('Home');
            }}
            className="cursor-pointer group inline-block"
          >
            <h1 className="font-serif font-black text-3xl sm:text-5xl tracking-widest text-black group-hover:text-blue-900 transition uppercase">
              NYNK
            </h1>
            <div className="text-[10px] tracking-[0.25em] uppercase text-gray-500 font-semibold mt-0.5">
              News You Need To Know • Multi-Perspective Intelligence
            </div>
          </div>
        </div>

        {/* Right: Subscribe / Sign In button matching Hague reference */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleAssistant}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-800 transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>AI Newsroom</span>
          </button>

          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-sm"
              >
                <span>{user?.name?.split(' ')[0] || 'Account'}</span>
              </button>

              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg py-1.5 z-50 text-xs">
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
                    <PieChart className="w-3.5 h-3.5" />
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
              className="px-4 py-1.5 rounded-md bg-[#1d4ed8] hover:bg-blue-800 text-white text-xs font-semibold tracking-wide transition shadow-sm"
            >
              Sign In
            </button>
          )}
        </div>
      </div>

      {/* Expandable Search Input */}
      {showSearch && (
        <div className="max-w-xl mx-auto px-4 pb-3">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search across all publishers, topics, and verified clusters..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-md border border-gray-300 focus:outline-none focus:border-black text-gray-900"
            />
          </div>
        </div>
      )}

      {/* Sub-Navigation Bar with Double Thin Border Rules */}
      <nav className="border-t border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center gap-6 sm:gap-8 overflow-x-auto py-2 text-xs font-medium text-gray-700 whitespace-nowrap">
          {NAV_TOPICS.map((topic) => {
            const isHome = topic === 'Home';
            const isSelected = isHome
              ? currentView === 'feed' && (selectedTopic === 'All' || selectedTopic === 'Home')
              : currentView === 'feed' && selectedTopic.toLowerCase() === topic.toLowerCase();

            return (
              <button
                key={topic}
                onClick={() => {
                  onSelectView('feed');
                  onSelectTopic(isHome ? 'All' : topic);
                }}
                className={`py-1 transition hover:text-black ${
                  isSelected
                    ? 'text-black font-bold border-b-2 border-black -mb-2 pb-1'
                    : 'text-gray-600'
                }`}
              >
                {topic}
              </button>
            );
          })}

          <span className="text-gray-300">|</span>

          {/* Blindspot Radar Nav item */}
          <button
            onClick={() => onSelectView('blindspots')}
            className={`py-1 transition flex items-center gap-1.5 ${
              currentView === 'blindspots'
                ? 'text-black font-bold border-b-2 border-black -mb-2 pb-1'
                : 'text-rose-700 hover:text-rose-900'
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

          {/* My News Diet Nav item */}
          <button
            onClick={() => onSelectView('diet')}
            className={`py-1 transition flex items-center gap-1.5 ${
              currentView === 'diet'
                ? 'text-black font-bold border-b-2 border-black -mb-2 pb-1'
                : 'text-gray-600 hover:text-black'
            }`}
          >
            <PieChart className="w-3.5 h-3.5 text-blue-600" />
            <span>My News Diet</span>
          </button>
        </div>
      </nav>
    </header>
  );
};
