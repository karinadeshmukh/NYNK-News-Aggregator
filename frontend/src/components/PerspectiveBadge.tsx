import React from 'react';

interface PerspectiveBadgeProps {
  perspective: 'Left' | 'Center' | 'Right' | 'Official' | string;
  className?: string;
  showIcon?: boolean;
}

export const PerspectiveBadge: React.FC<PerspectiveBadgeProps> = ({ perspective, className = '', showIcon = true }) => {
  const p = perspective.toLowerCase();

  if (p.includes('official') || p.includes('pib')) {
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#E8DFF5] text-purple-900 border border-purple-200 shadow-sm ${className}`}>
        {showIcon && <span className="w-1.5 h-1.5 rounded-full bg-purple-600"></span>}
        Official PIB
      </span>
    );
  }

  if (p.includes('left')) {
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FDE2E4] text-rose-900 border border-rose-200 shadow-sm ${className}`}>
        {showIcon && <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>}
        Left Leaning
      </span>
    );
  }

  if (p.includes('right')) {
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#DCFCE7] text-emerald-900 border border-emerald-200 shadow-sm ${className}`}>
        {showIcon && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>}
        Right Leaning
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#E0F2FE] text-sky-900 border border-sky-200 shadow-sm ${className}`}>
      {showIcon && <span className="w-1.5 h-1.5 rounded-full bg-sky-600"></span>}
      Center / Neutral
    </span>
  );
};
