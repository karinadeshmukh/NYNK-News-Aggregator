import React from 'react';

interface PerspectiveBadgeProps {
  perspective: 'Left' | 'Center' | 'Right' | 'Official' | string;
  size?: 'sm' | 'md';
  className?: string;
  showIcon?: boolean;
}

export const PerspectiveBadge: React.FC<PerspectiveBadgeProps> = ({
  perspective,
  size = 'md',
  className = '',
  showIcon = true
}) => {
  const p = perspective.toLowerCase();
  const padding = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  if (p.includes('official') || p.includes('pib')) {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-md font-bold uppercase tracking-wider bg-blue-50 text-blue-900 border border-blue-200 ${padding} ${className}`}>
        {showIcon && <span className="w-1.5 h-1.5 rounded-full bg-blue-700" />}
        Official PIB
      </span>
    );
  }

  if (p.includes('left') || p.includes('progressive')) {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-md font-bold uppercase tracking-wider bg-indigo-50 text-indigo-900 border border-indigo-200 ${padding} ${className}`}>
        {showIcon && <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />}
        Left Leaning
      </span>
    );
  }

  if (p.includes('right') || p.includes('conservative')) {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-md font-bold uppercase tracking-wider bg-red-50 text-red-900 border border-red-200 ${padding} ${className}`}>
        {showIcon && <span className="w-1.5 h-1.5 rounded-full bg-red-600" />}
        Right Leaning
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md font-bold uppercase tracking-wider bg-slate-100 text-slate-800 border border-slate-200 ${padding} ${className}`}>
      {showIcon && <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />}
      Center Wire
    </span>
  );
};
