import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, RefreshCw, User, LogOut, Bookmark, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  onToggleAssistant: () => void;
  onRefresh: () => void;
  onOpenAuth: () => void;
  isRefreshing: boolean;
  totalClusters: number;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleAssistant,
  onRefresh,
  onOpenAuth,
  isRefreshing,
  totalClusters
}) => {
  const { user, isAuthenticated, logout, isEditor } = useAuth();
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  return (
    <header className="w-full bg-cream-50/95 border-b border-slate-900/10 backdrop-blur-md sticky top-0 z-40">
      {/* Top micro ribbon announcement */}
      <div className="bg-cream-200/70 border-b border-slate-900/5 py-1 text-center text-[11px] font-medium text-slate-600 tracking-wide">
        <span>✦ Unbiased, multi-angle news intelligence with explainable AI ✦</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand: nynk. */}
        <div className="flex items-center gap-6">
          <a href="#" className="flex items-baseline gap-1 group">
            <span className="font-serif font-black text-3xl sm:text-4xl tracking-tight text-slate-900 group-hover:text-rose-950 transition">
              nynk.
            </span>
          </a>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 text-xs font-bold uppercase tracking-wider text-slate-700">
            <a href="#feed" className="hover:text-slate-950 transition hover:underline underline-offset-4 decoration-rose-300">
              Stories
            </a>
            <a href="#blindspots" className="hover:text-slate-950 transition hover:underline underline-offset-4 decoration-rose-300">
              Blindspots
            </a>
          </nav>
        </div>

        {/* Right Action buttons */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Sync Button */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white border border-slate-300 hover:border-slate-800 text-slate-800 hover:bg-slate-50 transition shadow-sm disabled:opacity-50"
            title="Ingest latest feeds & re-cluster"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-600 ${isRefreshing ? 'animate-spin text-rose-500' : ''}`} />
            <span className="hidden sm:inline">Sync Feeds</span>
          </button>

          {/* Pill Button: Ask AI News Assistant */}
          <button
            onClick={onToggleAssistant}
            className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full text-xs font-bold text-slate-900 bg-white border border-slate-900 hover:bg-rose-50 transition shadow-retro-sm hover:translate-x-0.5 hover:translate-y-0.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-rose-500" />
            <span className="hidden sm:inline">Ask AI Assistant</span>
            <span className="sm:hidden">AI</span>
          </button>

          {/* Authentication & Profile Button */}
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-[#E8DFF5] border border-purple-300 text-purple-950 hover:bg-purple-200 transition shadow-sm"
              >
                <div className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px] font-extrabold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="max-w-[80px] sm:max-w-[120px] truncate">{user.name}</span>
                <span className="text-[10px] uppercase px-1.5 py-0.2 rounded bg-purple-100 text-purple-800 border border-purple-300 font-bold hidden sm:inline">
                  {user.role}
                </span>
              </button>

              {/* User Dropdown */}
              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border-2 border-slate-900 shadow-retro-lg p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="pb-2.5 mb-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className="text-[10px] uppercase px-2 py-0.5 rounded-full bg-cream-200 text-slate-800 font-bold">
                        Role: {user.role}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="flex items-center justify-between p-2 rounded-xl text-slate-700 bg-cream-100">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Bookmark className="w-3.5 h-3.5 text-rose-500" />
                        Saved Stories
                      </span>
                      <span className="font-bold text-slate-900">
                        {user.bookmarked_cluster_ids?.length || 0}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        logout();
                        setShowUserDropdown(false);
                      }}
                      className="w-full flex items-center gap-2 p-2 rounded-xl text-rose-700 hover:bg-rose-50 font-bold transition text-left"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-4 py-2 rounded-full text-xs font-extrabold text-slate-900 bg-[#FDE2E4] border border-slate-900 hover:bg-[#FCD2D6] transition shadow-retro-sm hover:translate-x-0.5 hover:translate-y-0.5"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
