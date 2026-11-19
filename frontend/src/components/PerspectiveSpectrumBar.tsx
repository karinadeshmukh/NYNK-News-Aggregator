import React from 'react';

interface PerspectiveCounts {
  official_count?: number;
  left_count?: number;
  center_count?: number;
  right_count?: number;
  dominant_perspective?: string;
}

interface PerspectiveSpectrumBarProps {
  perspectives: PerspectiveCounts;
  totalOutlets?: number;
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
}

export const PerspectiveSpectrumBar: React.FC<PerspectiveSpectrumBarProps> = ({
  perspectives,
  totalOutlets,
  size = 'md',
  showLabels = true
}) => {
  const official = perspectives?.official_count || 0;
  const left = perspectives?.left_count || 0;
  const center = perspectives?.center_count || 0;
  const right = perspectives?.right_count || 0;

  const total = (official + left + center + right) || 1;
  const officialPct = Math.round((official / total) * 100);
  const leftPct = Math.round((left / total) * 100);
  const centerPct = Math.round((center / total) * 100);
  const rightPct = Math.round((right / total) * 100);

  const barHeight = size === 'sm' ? 'h-2' : size === 'lg' ? 'h-3.5' : 'h-2.5';

  return (
    <div className="w-full">
      {/* Stacked Spectrum Bar */}
      <div className={`w-full ${barHeight} rounded-full overflow-hidden flex bg-slate-100 p-0.5 gap-0.5 border border-slate-200/80 shadow-inner`}>
        {official > 0 && (
          <div
            style={{ width: `${Math.max(officialPct, 4)}%` }}
            className="bg-perspective-official rounded-sm transition-all duration-300 relative group"
            title={`Official PIB: ${official} source(s) (${officialPct}%)`}
          />
        )}
        {left > 0 && (
          <div
            style={{ width: `${Math.max(leftPct, 4)}%` }}
            className="bg-perspective-left rounded-sm transition-all duration-300 relative group"
            title={`Left / Progressive: ${left} source(s) (${leftPct}%)`}
          />
        )}
        {center > 0 && (
          <div
            style={{ width: `${Math.max(centerPct, 4)}%` }}
            className="bg-perspective-center rounded-sm transition-all duration-300 relative group"
            title={`Center / Wire: ${center} source(s) (${centerPct}%)`}
          />
        )}
        {right > 0 && (
          <div
            style={{ width: `${Math.max(rightPct, 4)}%` }}
            className="bg-perspective-right rounded-sm transition-all duration-300 relative group"
            title={`Right / Conservative: ${right} source(s) (${rightPct}%)`}
          />
        )}
      </div>

      {/* Legend & Percentages */}
      {showLabels && (
        <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 mt-2">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-perspective-official inline-block" />
            <span className="text-slate-700 font-semibold">{officialPct}%</span>
            <span className="hidden sm:inline text-slate-400">PIB</span>
          </div>

          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-perspective-left inline-block" />
            <span className="text-slate-700 font-semibold">{leftPct}%</span>
            <span className="hidden sm:inline text-slate-400">Left</span>
          </div>

          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-perspective-center inline-block" />
            <span className="text-slate-700 font-semibold">{centerPct}%</span>
            <span className="hidden sm:inline text-slate-400">Center</span>
          </div>

          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-perspective-right inline-block" />
            <span className="text-slate-700 font-semibold">{rightPct}%</span>
            <span className="hidden sm:inline text-slate-400">Right</span>
          </div>
        </div>
      )}
    </div>
  );
};
