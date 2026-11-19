import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  RefreshCw,
  User,
  LogOut,
  Bookmark,
  ShieldCheck,
  Search,
  Compass,
  PieChart,
  Newspaper
} from 'lucide-react';

interface HeaderProps {
  currentView: 'feed' | 'blindspots' | 'diet';
  onSelectView: (view: 'feed' | 'blindspots' | 'diet') => void;
  onToggleAssistant: () => void;
  onRefresh: () => void;
  onOpenAuth: () => void;
  isRefreshing: boolean;
  totalClusters: number;
  blindspotCount?: number;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onSelectView,
  onToggleAssistant,
  onRefresh,
  onOpenAuth,
  isRefreshing,
  totalClusters,
  blindspotCount = 0,
  searchQuery,
  onSearchChange
}) => {
  const { user, isAuthenticated, logout, isEditor } = useAuth();
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  return (
    <header className="w-full bg-white/95 border-b border-slate-200/90 backdrop-blur-md sticky top-0 z-40">
      {/* Top micro ribbon announcement */}
      <div className="bg-slate-900 text-slate-300 py-1 px-4 text-center text-[11px] font-medium tracking-wide flex items-center justify-center gap-3">
        <span className="flex items-center gap-1.5 text-slate-200 font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          MULTI-PERSPECTIVE NEWS INTELLIGENCE
        </span>
        <span className="hidden sm:inline text-slate-500">|</span>
        <span className="hidden sm:inline text-slate-400">
          Tracking Official Records (PIB), Left, Center Wire, and Right Media
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand: NYNK */}
        <div className="flex items-center gap-8 shrink-0">
          <div
            onClick={() => onSelectView('feed')}
            className="flex items-baseline gap-2 cursor-pointer group"
          >
            <span className="font-serif font-black text-2xl tracking-tight text-slate-900 group-hover:text-blue-900 transition">
              NYNK
            </span>
            <span className="hidden md:inline-block text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
              Intelligence
            </span>
          </div>

          {/* Navigation View Modes */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200/80 text-xs font-semibold">
            <button
              onClick={() => onSelectView('feed')}
              className={`py-1.5 px-3 rounded-md transition flex items-center gap-1.5 ${
                currentView === 'feed'
                  ? 'bg-white text-slate-900 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Newspaper className="w-3.5 h-3.5" />
              <span>Top Stories</span>
            </button>

            <button
              onClick={() => onSelectView('blindspots')}
              className={`py-1.5 px-3 rounded-md transition flex items-center gap-1.5 ${
                currentView === 'blindspots'
                  ? 'bg-white text-slate-900 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-rose-500" />
              <span>Blindspot Radar</span>
              {blindspotCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {blindspotCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onSelectView('diet')}
              className={`py-1.5 px-3 rounded-md transition flex items-center gap-1.5 ${
                currentView === 'diet'
                  ? 'bg-white text-slate-900 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <PieChart className="w-3.5 h-3.5 text-blue-600" />
              <span>My News Diet</span>
            </button>
          </nav>
        </div>

        {/* Global Search Bar */}
        <div className="flex-1 max-w-xs hidden sm:block">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search news or topics..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-800 transition"
            />
          </div>
        </div>

        {/* Right Action buttons */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Sync Button */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 hover:border-slate-400 text-slate-700 hover:bg-slate-50 transition shadow-sm disabled:opacity-50"
            title="Ingest latest feeds & re-cluster"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
            <span className="hidden sm:inline">Sync Feeds</span>
          </button>

          {/* AI Assistant Button */}
          <button
            onClick={onToggleAssistant}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">AI Newsroom</span>
          </button>

          {/* User Profile / Auth Button */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2 p-1 pl-2.5 pr-2 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 hover:bg-slate-200/80 transition text-xs font-semibold"
              >
                <span className="max-w-[100px] truncate">{user?.name}</span>
                <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[11px]">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              </button>

              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-dropdown py-1.5 z-50 text-xs">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="font-bold text-slate-900">{user?.name}</p>
                    <p className="text-slate-500 text-[11px] truncate">{user?.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                      Role: {user?.role}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      onSelectView('diet');
                      setShowUserDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <PieChart className="w-3.5 h-3.5 text-slate-500" />
                    <span>My News Diet</span>
                  </button>

                  <button
                    onClick={() => {
                      logout();
                      setShowUserDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 text-rose-600 hover:bg-rose-50 flex items-center gap-2 border-t border-slate-100"
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
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 transition"
            >
              <User className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
