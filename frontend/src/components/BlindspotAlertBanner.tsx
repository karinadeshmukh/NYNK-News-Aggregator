import React from 'react';
import { Blindspot } from '../services/api';
import { AlertCircle, EyeOff, ArrowRight } from 'lucide-react';
import { PerspectiveBadge } from './PerspectiveBadge';

interface BlindspotAlertBannerProps {
  blindspots: Blindspot[];
  onSelectCluster: (clusterId: string) => void;
}

export const BlindspotAlertBanner: React.FC<BlindspotAlertBannerProps> = ({
  blindspots,
  onSelectCluster
}) => {
  if (!blindspots || blindspots.length === 0) return null;

  return (
    <section id="blindspots" className="mb-12 rounded-3xl bg-[#FEF9EF] border-2 border-slate-900/20 p-6 sm:p-8 shadow-retro">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-block px-3 py-1 rounded-md bg-[#FDE2E4] border border-rose-300 text-xs font-bold text-rose-950 uppercase tracking-wider mb-2">
            ⚡ Media Blindspot Detection
          </div>
          <h2 className="font-serif font-black text-2xl sm:text-3xl text-slate-900 tracking-tight">
            Stories One Side of the Media is Ignoring
          </h2>
          <p className="text-xs sm:text-sm text-slate-700 mt-1 max-w-2xl">
            When major outlets from one viewpoint report heavily while opposing newsrooms stay silent, NYNK flags the coverage gap.
          </p>
        </div>

        <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-white border border-slate-900 shadow-retro-sm">
          {blindspots.length} Blindspots Flagged
        </span>
      </div>

      {/* Grid of Blindspot Alert Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {blindspots.map((b, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-white border-2 border-slate-900/15 shadow-retro-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  Missing {b.missing_perspective} Coverage
                </span>
                <PerspectiveBadge perspective={b.missing_perspective} />
              </div>

              <h4 className="font-serif font-bold text-base sm:text-lg text-slate-900 mb-2 leading-snug">
                {b.cluster_title}
              </h4>

              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                {b.message}
              </p>
            </div>

            <button
              onClick={() => onSelectCluster(b.cluster_id)}
              className="py-2 px-4 rounded-full text-xs font-bold text-slate-900 bg-[#E0F2FE] hover:bg-[#BAE6FD] border border-slate-900 transition flex items-center justify-center gap-1.5 self-start shadow-sm"
            >
              <span>Examine Story Breakdown</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};
